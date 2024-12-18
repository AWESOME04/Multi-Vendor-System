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
                    'SELECT price, stock_quantity FROM products WHERE product_id = $1 FOR UPDATE',
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
                    `INSERT INTO order_items (order_id, product_id, quantity, price_at_time)
                    SELECT $1, $2, $3, price
                    FROM products
                    WHERE product_id = $2`,
                    [order.order_id, item.productId, item.quantity]
                );

                await client.query(
                    'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE product_id = $2',
                    [item.quantity, item.productId]
                );
            }

            await client.query('COMMIT');

            // Get user email for notification
            const userResult = await client.query(
                'SELECT email FROM users WHERE user_id = $1',
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
                        body: `Your order #${order.order_id} has been placed successfully.`,
                        metadata: { orderId: order.order_id }
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
                `SELECT o.*, u.email as user_email
                FROM orders o
                JOIN users u ON o.user_id = u.user_id
                WHERE o.order_id = $1 AND o.user_id = $2`,
                [orderId, userId]
            );

            if (result.rows.length === 0) {
                return null;
            }

            const order = result.rows[0];

            // Get order items
            const itemsResult = await client.query(
                `SELECT oi.*, p.title as product_title
                FROM order_items oi
                JOIN products p ON oi.product_id = p.product_id
                WHERE oi.order_id = $1`,
                [orderId]
            );

            order.items = itemsResult.rows;
            return order;
        } finally {
            client.release();
        }
    }

    async getUserOrders(userId) {
        const client = await db.pool.connect();
        try {
            const query = `
                SELECT o.*, oi.*, p.title as product_title, u.email as user_email
                FROM orders o
                JOIN order_items oi ON o.order_id = oi.order_id
                JOIN products p ON oi.product_id = p.product_id
                JOIN users u ON o.user_id = u.user_id
                WHERE o.user_id = $1
                ORDER BY o.created_at DESC
            `;
            
            const result = await client.query(query, [userId]);
            return result.rows;
        } finally {
            client.release();
        }
    }

    async deleteOrderItems(orderId) {
        const client = await db.pool.connect();
        try {
            await client.query('DELETE FROM order_items WHERE order_id = $1', [orderId]);
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
                `SELECT o.*, u.email as user_email
                FROM orders o
                JOIN users u ON o.user_id = u.user_id
                WHERE o.order_id = $1 AND o.user_id = $2`,
                [orderId, userId]
            );

            if (orderResult.rows.length === 0) {
                throw new Error('Order not found or unauthorized');
            }

            const order = orderResult.rows[0];

            // Get order items to return stock
            const itemsResult = await client.query(
                'SELECT product_id, quantity FROM order_items WHERE order_id = $1',
                [orderId]
            );

            // Return items to inventory
            for (const item of itemsResult.rows) {
                await client.query(
                    'UPDATE products SET stock_quantity = stock_quantity + $1 WHERE product_id = $2',
                    [item.quantity, item.product_id]
                );
            }

            // Delete order items
            await this.deleteOrderItems(orderId);

            // Delete order
            await client.query('DELETE FROM orders WHERE order_id = $1', [orderId]);

            await client.query('COMMIT');

            // Get user email for notification
            const userResult = await client.query(
                'SELECT email FROM users WHERE user_id = $1',
                [userId]
            );

            const userEmail = userResult.rows[0].email;

            // Publish notification event
            if (rabbitmq.channel) {
                const notificationEvent = {
                    type: 'notification.email',
                    data: {
                        to: userEmail,
                        subject: 'Order Cancelled',
                        body: `Your order #${orderId} has been cancelled.`,
                        metadata: { orderId }
                    }
                };

                rabbitmq.channel.publish(
                    QUEUES.NOTIFICATION_EVENTS.exchange,
                    QUEUES.NOTIFICATION_EVENTS.routingKey,
                    Buffer.from(JSON.stringify(notificationEvent))
                );
            }

            return { message: 'Order deleted successfully' };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async updateOrderStatus(orderId, userId, status) {
        const client = await db.pool.connect();
        try {
            const result = await client.query(
                `UPDATE orders 
                SET status = $1, updated_at = CURRENT_TIMESTAMP
                WHERE order_id = $2 AND user_id = $3
                RETURNING *`,
                [status, orderId, userId]
            );

            if (result.rows.length === 0) {
                throw new Error('Order not found or unauthorized');
            }

            const order = result.rows[0];

            // Get user email
            const userResult = await client.query(
                'SELECT email FROM users WHERE user_id = $1',
                [userId]
            );

            const userEmail = userResult.rows[0].email;

            // Publish notification event
            if (rabbitmq.channel) {
                const notificationEvent = {
                    type: 'notification.email',
                    data: {
                        to: userEmail,
                        subject: 'Order Status Updated',
                        body: `Your order #${orderId} status has been updated to ${status}.`,
                        metadata: { orderId }
                    }
                };

                rabbitmq.channel.publish(
                    QUEUES.NOTIFICATION_EVENTS.exchange,
                    QUEUES.NOTIFICATION_EVENTS.routingKey,
                    Buffer.from(JSON.stringify(notificationEvent))
                );
            }

            return order;
        } finally {
            client.release();
        }
    }
}

module.exports = new OrderService();
