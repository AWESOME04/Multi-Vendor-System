const { QUEUES } = require('../config/constants');

class OrderPublisher {
    constructor(channel) {
        this.channel = channel;
    }

    async publishOrderPlaced(orderData) {
        try {
            const payload = {
                event: 'order.placed',
                timestamp: new Date().toISOString(),
                data: orderData
            };

            this.channel.publish(
                QUEUES.ORDER_EVENTS.exchange,
                QUEUES.ORDER_EVENTS.routingKey,
                Buffer.from(JSON.stringify(payload))
            );
            console.log('Order placed event published');
        } catch (error) {
            console.error('Error publishing order placed event:', error);
            throw error;
        }
    }
}

module.exports = OrderPublisher;