const db = require('../database/db');
const notificationService = require('./notificationService');
const rabbitmq = require('../config/rabbitmq');
const { QUEUES } = require('../config/constants');

class OrderService {
    async createOrder(userId, items) {
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');

            // Check if user is a buyer
            const userResult = await client.query(
                'SELECT role FROM users WHERE id = $1',
                [userId]
            );

            if (userResult.rows.length === 0) {
                throw new Error('User not found');
            }

            if (userResult.rows[0].role !== 'buyer') {
                throw new Error('Only buyers can create orders');
            }

            // Calculate total amount and verify stock
            let totalAmount = 0;
            for (const item of items) {
                const productResult = await client.query(
                    'SELECT price, stock_quantity FROM products WHERE id = $1 FOR UPDATE',
                    [item.productId]
                );

                if (productResult.rows.length === 0) {
                    throw new Error(`Product ${item.productId} not found`);
                }

                const product = productResult.rows[0];
                if (product.stock_quantity < item.quantity) {
                    throw new Error(`Insufficient stock for product ${item.productId}`);
                }

                totalAmount += product.price * item.quantity;
            }

            // Create order
            const orderResult = await client.query(
                `INSERT INTO orders (user_id, total_amount, status, created_at, updated_at)
                VALUES ($1, $2, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                RETURNING *`,
                [userId, totalAmount]
            );

            const order = orderResult.rows[0];

            // Create order items and update stock
            for (const item of items) {
                await client.query(
                    `INSERT INTO order_items (order_id, product_id, quantity, price)
                    SELECT $1, $2, $3, price
                    FROM products
                    WHERE id = $2`,
                    [order.id, item.productId, item.quantity]
                );

                // Update stock quantity
                await client.query(
                    `UPDATE products 
                    SET stock_quantity = stock_quantity - $1,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = $2`,
                    [item.quantity, item.productId]
                );
            }

            await client.query('COMMIT');

            // Send notification
            await notificationService.sendOrderNotification(order.id, userId, 'order_created');

            // Publish to order processing queue
            await rabbitmq.publishToQueue(QUEUES.ORDER_PROCESSING, {
                orderId: order.id,
                userId,
                items,
                totalAmount
            });

            return order;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async getUserOrders(userId) {
        const result = await db.query(
            `SELECT o.*,
                    json_agg(
                        json_build_object(
                            'id', oi.id,
                            'product_id', oi.product_id,
                            'quantity', oi.quantity,
                            'price', oi.price,
                            'product', json_build_object(
                                'title', p.title,
                                'image', p.product_image
                            )
                        )
                    ) as items
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN products p ON oi.product_id = p.id
            WHERE o.user_id = $1
            GROUP BY o.id
            ORDER BY o.created_at DESC`,
            [userId]
        );

        return result.rows;
    }

    async getOrder(orderId, userId) {
        const result = await db.query(
            `SELECT o.*,
                    json_agg(
                        json_build_object(
                            'id', oi.id,
                            'product_id', oi.product_id,
                            'quantity', oi.quantity,
                            'price', oi.price,
                            'product', json_build_object(
                                'title', p.title,
                                'image', p.product_image
                            )
                        )
                    ) as items
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN products p ON oi.product_id = p.id
            WHERE o.id = $1 AND o.user_id = $2
            GROUP BY o.id`,
            [orderId, userId]
        );

        return result.rows[0];
    }

    async updateOrderStatus(orderId, status) {
        const result = await db.query(
            `UPDATE orders 
            SET status = $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *`,
            [status, orderId]
        );

        if (result.rows.length === 0) {
            throw new Error('Order not found');
        }

        const order = result.rows[0];
        await notificationService.sendOrderNotification(orderId, order.user_id, 'order_status_updated');

        return order;
    }

    async cancelOrder(orderId, userId) {
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');

            // Get order and verify ownership
            const orderResult = await client.query(
                'SELECT * FROM orders WHERE id = $1 AND user_id = $2 FOR UPDATE',
                [orderId, userId]
            );

            if (orderResult.rows.length === 0) {
                throw new Error('Order not found');
            }

            const order = orderResult.rows[0];
            if (order.status !== 'pending') {
                throw new Error('Can only cancel pending orders');
            }

            // Get order items
            const itemsResult = await client.query(
                'SELECT * FROM order_items WHERE order_id = $1',
                [orderId]
            );

            // Restore stock quantities
            for (const item of itemsResult.rows) {
                await client.query(
                    `UPDATE products 
                    SET stock_quantity = stock_quantity + $1,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = $2`,
                    [item.quantity, item.product_id]
                );
            }

            // Update order status
            await client.query(
                `UPDATE orders 
                SET status = 'cancelled',
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $1`,
                [orderId]
            );

            await client.query('COMMIT');

            // Send notification
            await notificationService.sendOrderNotification(orderId, userId, 'order_cancelled');

            return { message: 'Order cancelled successfully' };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}

module.exports = new OrderService();
