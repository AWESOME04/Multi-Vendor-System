const { QUEUES } = require('../config/constants');

class OrderConsumer {
    constructor(channel) {
        this.channel = channel;
    }

    async startConsuming() {
        try {
            await this.channel.consume(
                QUEUES.ORDER_EVENTS.name,
                async (message) => {
                    const content = JSON.parse(message.content.toString());
                    
                    console.log('Received order event:', content);
                    
                    // Process the order based on event type
                    switch(content.event) {
                        case 'order.placed':
                            await this.handleOrderPlaced(content.data);
                            break;
                        // Add more cases as needed
                    }

                    // Acknowledge the message
                    this.channel.ack(message);
                }
            );
            console.log('Order consumer started');
        } catch (error) {
            console.error('Error in order consumer:', error);
            throw error;
        }
    }

    async handleOrderPlaced(orderData) {
        // Implement order processing logic
        console.log('Processing order:', orderData);
    }
}

module.exports = OrderConsumer;