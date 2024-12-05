require('dotenv').config();
const rabbitMQ = require('../config/rabbitmq');
const OrderConsumer = require('../consumers/orderConsumer');

async function testConsumer() {
    try {
        const channel = await rabbitMQ.connect();
        const orderConsumer = new OrderConsumer(channel);
        await orderConsumer.startConsuming();
        console.log('Consumer is running and waiting for messages...');
    } catch (error) {
        console.error('Test consumer error:', error);
        process.exit(1);
    }
}

testConsumer();