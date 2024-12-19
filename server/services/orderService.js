const db = require('../database/db');
const notificationService = require('./notificationService');
const rabbitmq = require('../config/rabbitmq');
const { QUEUES } = require('../config/constants');

class OrderService {
    async createOrder(userId, items) {
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');

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
                `INSERT INTO orders (user_id, total_amount, status)
                VALUES ($1, $2, 'pending')
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

                await client.query(
                    'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2',
                    [item.quantity, item.productId]
                );
            }

            await client.query('COMMIT');

            // Get user email for notification
            const userResult = await client.query(
                'SELECT email FROM users WHERE id = $1',
                [userId]
            );

            const userEmail = userResult.rows[0].email;

            // Publish notification event
            if (rabbitmq.channel) {
                const notificationEvent = {
                    type: 'notification.email',
                    data: {
                        to: userEmail,
                        subject: 'Order Confirmation',
                        body: `Your order #${order.id} has been placed successfully.`,
                        metadata: { orderId: order.id }
                    }
                };

                rabbitmq.channel.publish(
                    QUEUES.NOTIFICATION_EVENTS.exchange,
                    QUEUES.NOTIFICATION_EVENTS.routingKey,
                    Buffer.from(JSON.stringify(notificationEvent))
                );
            }

            return order;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async getOrder(orderId, userId) {
        const client = await db.pool.connect();
        try {
            const result = await client.query(
                `SELECT o.*, u.email as user_email,
                    json_agg(
                        json_build_object(
                            'id', oi.id,
                            'product_id', p.id,
                            'name', p.name,
                            'quantity', oi.quantity,
                            'price', oi.price,
                            'image', p.product_image
                        )
                    ) as items
                FROM orders o
                JOIN users u ON o.user_id = u.id
                LEFT JOIN order_items oi ON o.id = oi.order_id
                LEFT JOIN products p ON oi.product_id = p.id
                WHERE o.id = $1 AND o.user_id = $2
                GROUP BY o.id, u.email`,
                [orderId, userId]
            );

            return result.rows[0] || null;
        } finally {
            client.release();
        }
    }

    async getUserOrders(userId) {
        const client = await db.pool.connect();
        try {
            const result = await client.query(
                `SELECT o.*,
                    json_agg(
                        json_build_object(
                            'id', oi.id,
                            'product_id', p.id,
                            'name', p.name,
                            'quantity', oi.quantity,
                            'price', oi.price,
                            'image', p.product_image
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
        } finally {
            client.release();
        }
    }

    async updateOrderStatus(orderId, userId, status) {
        const client = await db.pool.connect();
        try {
            const result = await client.query(
                `UPDATE orders
                SET status = $1
                WHERE id = $2 AND user_id = $3
                RETURNING *`,
                [status, orderId, userId]
            );

            if (result.rows.length === 0) {
                throw new Error('Order not found or unauthorized');
            }

            return result.rows[0];
        } finally {
            client.release();
        }
    }

    async deleteOrder(orderId, userId) {
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');

            // Check if order exists and belongs to user
            const orderResult = await client.query(
                'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
                [orderId, userId]
            );

            if (orderResult.rows.length === 0) {
                throw new Error('Order not found or unauthorized');
            }

            // Get order items to return stock
            const itemsResult = await client.query(
                'SELECT product_id, quantity FROM order_items WHERE order_id = $1',
                [orderId]
            );

            // Return items to inventory
            for (const item of itemsResult.rows) {
                await client.query(
                    'UPDATE products SET stock_quantity = stock_quantity + $1 WHERE id = $2',
                    [item.quantity, item.product_id]
                );
            }

            // Delete order items
            await client.query('DELETE FROM order_items WHERE order_id = $1', [orderId]);

            // Delete order
            await client.query('DELETE FROM orders WHERE id = $1', [orderId]);

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}

module.exports = new OrderService();
