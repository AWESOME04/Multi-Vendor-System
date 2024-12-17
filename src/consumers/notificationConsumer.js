const { QUEUES } = require('../config/constants');
const notificationService = require('../services/notificationService');

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

                    try {
                        switch(content.type) {
                            case 'notification.email':
                                await this.handleEmailNotification(content.data);
                                break;
                            case 'notification.sms':
                                await this.handleSMSNotification(content.data);
                                break;
                            case 'notification.push':
                                await this.handlePushNotification(content.data);
                                break;
                            default:
                                console.warn('Unknown notification type:', content.type);
                        }
                        // Acknowledge the message only if processing was successful
                        this.channel.ack(message);
                    } catch (error) {
                        console.error('Error processing notification:', error);
                        // Reject the message and requeue it
                        this.channel.nack(message, false, true);
                    }
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
            await notificationService.sendNotification('email', {
                to: data.to,
                subject: data.subject,
                body: data.body
            });
            console.log('Email notification sent successfully');
        } catch (error) {
            console.error('Error handling email notification:', error);
            throw error;
        }
    }

    async handleSMSNotification(data) {
        try {
            await notificationService.sendNotification('sms', {
                phoneNumber: data.phoneNumber,
                message: data.message
            });
            console.log('SMS notification sent successfully');
        } catch (error) {
            console.error('Error handling SMS notification:', error);
            throw error;
        }
    }

    async handlePushNotification(data) {
        try {
            await notificationService.sendNotification('push', {
                userId: data.userId,
                title: data.title,
                message: data.message
            });
            console.log('Push notification sent successfully');
        } catch (error) {
            console.error('Error handling push notification:', error);
            throw error;
        }
    }
}

module.exports = NotificationConsumer;