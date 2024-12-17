const nodemailer = require('nodemailer');

class NotificationService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
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
        const strategy = this.notificationStrategies[type];
        if (!strategy) {
            throw new Error(`Notification type '${type}' not supported`);
        }
        return strategy(data);
    }

    async sendEmail({ to, subject, body }) {
        try {
            const info = await this.transporter.sendMail({
                from: process.env.SMTP_USER,
                to,
                subject,
                html: body
            });
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Email sending failed:', error);
            throw new Error('Failed to send email notification');
        }
    }

    async sendSMS({ phoneNumber, message }) {
        // Placeholder for SMS implementation
        console.log('SMS notification:', { phoneNumber, message });
        return { success: true, message: 'SMS notification sent (mock)' };
    }

    async sendPushNotification({ userId, title, message }) {
        // Placeholder for push notification implementation
        console.log('Push notification:', { userId, title, message });
        return { success: true, message: 'Push notification sent (mock)' };
    }
}

module.exports = new NotificationService();
