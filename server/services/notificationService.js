const nodemailer = require('nodemailer');
const rabbitmq = require('../config/rabbitmq');
const { QUEUES } = require('../config/constants');

class NotificationService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        this.sentFrom = process.env.SMTP_USER;
    }

    async sendNotification(type, data) {
        console.log(`Sending ${type} notification:`, data);
        
        switch (type) {
            case 'email':
                return await this.sendEmail(data);
            case 'sms':
                return await this.sendSMS(data);
            case 'push':
                return await this.sendPushNotification(data);
            default:
                throw new Error(`Unsupported notification type: ${type}`);
        }
    }

    async sendEmail({ to, subject, body }) {
        try {
            console.log('Sending email to:', to);
            
            const mailOptions = {
                from: this.sentFrom,
                to: to,
                subject: subject,
                html: body,
                text: body.replace(/<[^>]*>/g, '') // Strip HTML for text version
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email sent successfully:', info);
            return { success: true, info };
        } catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }
    }

    async sendSMS({ phoneNumber, message }) {
        // TODO: Implement SMS service
        console.log('SMS notification (mock):', { phoneNumber, message });
        return { success: true, mock: true };
    }

    async sendPushNotification({ userId, title, message }) {
        // TODO: Implement push notifications
        console.log('Push notification (mock):', { userId, title, message });
        return { success: true, mock: true };
    }

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
