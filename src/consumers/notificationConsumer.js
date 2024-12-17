const { QUEUES } = require('../config/constants');

class NotificationConsumer {
    constructor(channel) {
        this.channel = channel;
    }

    async startConsuming() {
        try {
            await this.channel.consume(
                QUEUES.NOTIFICATION_EVENTS.name,
                async (message) => {
                    const content = JSON.parse(message.content.toString());
                    console.log('Received notification event:', content);

                    switch(content.event) {
                        case 'notification.email':
                            await this.handleEmailNotification(content.data);
                            break;
                        case 'notification.sms':
                            await this.handleSMSNotification(content.data);
                            break;
                        default:
                            console.warn('Unknown notification event type:', content.event);
                    }

                    // Acknowledge the message
                    this.channel.ack(message);
                },
                { noAck: false }
            );
            console.log('Notification consumer started');
        } catch (error) {
            console.error('Error starting notification consumer:', error);
            throw error;
        }
    }

    async handleEmailNotification(data) {
        try {
            // TODO: Integrate with email service (SendGrid, Mailgun, or Amazon SES)
            console.log('Processing email notification:', {
                to: data.to,
                subject: data.subject,
                body: data.body
            });
            // Add actual email sending logic here
        } catch (error) {
            console.error('Error handling email notification:', error);
            throw error;
        }
    }

    async handleSMSNotification(data) {
        try {
            // TODO: Integrate with SMS service
            console.log('Processing SMS notification:', {
                to: data.to,
                message: data.message
            });
            // Add actual SMS sending logic here
        } catch (error) {
            console.error('Error handling SMS notification:', error);
            throw error;
        }
    }
}

module.exports = NotificationConsumer;