const db = require('../database/db');
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
                
                const product = productResult.rows[0];
                if (!product || product.stock_quantity < item.quantity) {
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
            const userResult = await db.query('SELECT email FROM users WHERE user_id = $1', [userId]);
            const userEmail = userResult.rows[0]?.email;

            // Publish order event
            if (rabbitmq.channel) {
                const orderEvent = {
                    type: 'order.created',
                    data: {
                        orderId: order.order_id,
                        userId: userId,
                        totalAmount: totalAmount,
                        email: userEmail,
                        items: items
                    }
                };

                rabbitmq.channel.publish(
                    QUEUES.ORDER_EVENTS.exchange,
                    QUEUES.ORDER_EVENTS.routingKey,
                    Buffer.from(JSON.stringify(orderEvent))
                );

                // Publish notification event
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
        const query = `
            SELECT o.*, oi.*, p.title as product_title
            FROM orders o
            JOIN order_items oi ON o.order_id = oi.order_id
            JOIN products p ON oi.product_id = p.product_id
            WHERE o.order_id = $1 AND o.user_id = $2
        `;
        
        const result = await db.query(query, [orderId, userId]);
        return this.formatOrderResult(result.rows);
    }

    async getUserOrders(userId) {
        const query = `
            SELECT o.*, oi.*, p.title as product_title
            FROM orders o
            JOIN order_items oi ON o.order_id = oi.order_id
            JOIN products p ON oi.product_id = p.product_id
            WHERE o.user_id = $1
            ORDER BY o.created_at DESC
        `;
        
        const result = await db.query(query, [userId]);
        return this.formatOrderResult(result.rows);
    }

    formatOrderResult(rows) {
        if (rows.length === 0) return null;

        const orders = {};
        rows.forEach(row => {
            if (!orders[row.order_id]) {
                orders[row.order_id] = {
                    orderId: row.order_id,
                    userId: row.user_id,
                    totalAmount: row.total_amount,
                    status: row.status,
                    createdAt: row.created_at,
                    items: []
                };
            }

            orders[row.order_id].items.push({
                productId: row.product_id,
                title: row.product_title,
                quantity: row.quantity,
                priceAtTime: row.price_at_time
            });
        });

        return Object.values(orders);
    }
}

module.exports = new OrderService();
