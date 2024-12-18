require('dotenv').config();
const rabbitMQ = require('../config/rabbitmq');
const OrderPublisher = require('../publishers/orderPublisher');

async function testPublisher() {
    try {
        const channel = await rabbitMQ.connect();
        const orderPublisher = new OrderPublisher(channel);

        const orderData = {
            order_id: 'uuid-1234',
            user_id: 'uuid-5678',
            products: [
                {
                    product_id: 'uuid-product-1',
                    quantity: 2,
                    unit_price: 29.99
                }
            ],
            total_amount: 59.98
        };

        await orderPublisher.publishOrderPlaced(orderData);
        console.log('Test message published');
        
        // Close connection after publishing
        setTimeout(() => {
            rabbitMQ.closeConnection();
            process.exit(0);
        }, 500);
    } catch (error) {
        console.error('Test publisher error:', error);
        process.exit(1);
    }
}

testPublisher();