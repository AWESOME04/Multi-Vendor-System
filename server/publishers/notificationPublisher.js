const { QUEUES } = require('../config/constants');

class NotificationPublisher {
    constructor(channel) {
        this.channel = channel;
    }

    async publishEmailNotification(notificationData) {
        try {
            const payload = {
                event: 'notification.email',
                timestamp: new Date().toISOString(),
                data: {
                    to: notificationData.email,
                    subject: notificationData.subject,
                    body: notificationData.body,
                    metadata: notificationData.metadata || {}
                }
            };

            this.channel.publish(
                QUEUES.NOTIFICATION_EVENTS.exchange,
                QUEUES.NOTIFICATION_EVENTS.routingKey,
                Buffer.from(JSON.stringify(payload))
            );
            console.log('Email notification event published');
        } catch (error) {
            console.error('Error publishing email notification:', error);
            throw error;
        }
    }

    async publishSMSNotification(notificationData) {
        try {
            const payload = {
                event: 'notification.sms',
                timestamp: new Date().toISOString(),
                data: {
                    to: notificationData.phoneNumber,
                    message: notificationData.message,
                    metadata: notificationData.metadata || {}
                }
            };

            this.channel.publish(
                QUEUES.NOTIFICATION_EVENTS.exchange,
                QUEUES.NOTIFICATION_EVENTS.routingKey,
                Buffer.from(JSON.stringify(payload))
            );
            console.log('SMS notification event published');
        } catch (error) {
            console.error('Error publishing SMS notification:', error);
            throw error;
        }
    }
}

module.exports = NotificationPublisher;