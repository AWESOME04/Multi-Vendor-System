const amqp = require('amqplib');
const { QUEUES } = require('./constants');

class RabbitMQConnection {
    constructor() {
        this.connection = null;
        this.channel = null;
    }

    async connect() {
        try {
            this.connection = await amqp.connect(process.env.RABBITMQ_URL);
            this.channel = await this.connection.createChannel();

            // Setup exchanges and queues
            await this.setupExchangesAndQueues();

            console.log('Connected to RabbitMQ');
            return this.channel;
        } catch (error) {
            console.error('RabbitMQ Connection Error:', error);
            throw error;
        }
    }

    async setupExchangesAndQueues() {
        // Setup for ORDER_EVENTS
        await this.channel.assertExchange(
            QUEUES.ORDER_EVENTS.exchange,
            QUEUES.ORDER_EVENTS.type,
            { durable: true }
        );
        await this.channel.assertQueue(QUEUES.ORDER_EVENTS.name, { durable: true });
        await this.channel.bindQueue(
            QUEUES.ORDER_EVENTS.name,
            QUEUES.ORDER_EVENTS.exchange,
            QUEUES.ORDER_EVENTS.routingKey
        );

        // Setup for NOTIFICATION_EVENTS
        await this.channel.assertExchange(
            QUEUES.NOTIFICATION_EVENTS.exchange,
            QUEUES.NOTIFICATION_EVENTS.type,
            { durable: true }
        );
        await this.channel.assertQueue(QUEUES.NOTIFICATION_EVENTS.name, { durable: true });
        await this.channel.bindQueue(
            QUEUES.NOTIFICATION_EVENTS.name,
            QUEUES.NOTIFICATION_EVENTS.exchange,
            QUEUES.NOTIFICATION_EVENTS.routingKey
        );
    }

    async closeConnection() {
        try {
            await this.channel.close();
            await this.connection.close();
        } catch (error) {
            console.error('Error closing RabbitMQ connection:', error);
        }
    }
}

module.exports = new RabbitMQConnection();