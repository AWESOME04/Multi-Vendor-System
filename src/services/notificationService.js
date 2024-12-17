const nodemailer = require('nodemailer');
const rabbitmq = require('../config/rabbitmq');
const { QUEUES } = require('../config/constants');

class NotificationService {
    constructor() {
        // Initialize email transporter
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_PORT === '465',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        // Test email connection
        this.transporter.verify((error, success) => {
            if (error) {
                console.error('Error verifying email connection:', error);
            } else {
                console.log('Email server is ready to send messages');
            }
        });

        // Strategy pattern for different notification types
        this.notificationStrategies = {
            email: this.sendEmail.bind(this),
            sms: this.sendSMS.bind(this),
            push: this.sendPushNotification.bind(this)
        };
    }

    async sendNotification(type, data) {
        console.log(`Sending ${type} notification:`, data);
        
        const strategy = this.notificationStrategies[type];
        if (!strategy) {
            throw new Error(`Unsupported notification type: ${type}`);
        }
        return strategy(data);
    }

    async sendEmail({ to, subject, body }) {
        try {
            console.log('Sending email to:', to);
            const info = await this.transporter.sendMail({
                from: process.env.SMTP_USER,
                to,
                subject,
                html: body
            });
            console.log('Email sent successfully:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }
    }

    async sendSMS({ phoneNumber, message }) {
        // TODO: Implement SMS service (e.g., Twilio)
        console.log('SMS notification (mock):', { phoneNumber, message });
        return { success: true, mock: true };
    }

    async sendPushNotification({ userId, title, message }) {
        // TODO: Implement push notifications (e.g., Firebase Cloud Messaging)
        console.log('Push notification (mock):', { userId, title, message });
        return { success: true, mock: true };
    }

    // Method to publish notification events to RabbitMQ
    async publishNotificationEvent(type, data) {
        try {
            if (!rabbitmq.channel) {
                throw new Error('RabbitMQ channel not initialized');
            }

            const event = {
                type: `notification.${type}`,
                data,
                timestamp: new Date().toISOString()
            };

            rabbitmq.channel.publish(
                QUEUES.NOTIFICATION_EVENTS.exchange,
                QUEUES.NOTIFICATION_EVENTS.routingKey,
                Buffer.from(JSON.stringify(event))
            );

            console.log(`Published ${type} notification event to queue`);
            return true;
        } catch (error) {
            console.error('Error publishing notification event:', error);
            throw error;
        }
    }
}

module.exports = new NotificationService();
