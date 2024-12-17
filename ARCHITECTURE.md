# Multi-Vendor E-Commerce System Architecture

## System Overview
This is a microservices-based multi-vendor e-commerce platform that uses PostgreSQL for data storage and RabbitMQ for message queuing. The system is designed to handle multiple vendors, products, orders, and notifications efficiently and scalably.

### Core Tables
1. Users Table
   - user_id (Primary Key)
   - email
   - roles
   - other user details

2. Products Table
   - product_id (Primary Key)
   - seller_id (Foreign Key -> Users)
   - title
   - description
   - price
   - image_url
   - stock_quantity

3. Orders Table
   - order_id (Primary Key)
   - user_id (Foreign Key -> Users)
   - product_id (Foreign Key -> Products)
   - order_status
   - timestamp

## Message Queue Architecture

### RabbitMQ Exchanges and Queues

1. Order Exchange (Direct)
   - Name: order_exchange
   - Type: Direct
   - Queue: order_events
   - Routing Key: order.events
   - Events:
     ```json
     {
       "event": "order.placed",
       "timestamp": "ISO-8601-timestamp",
       "data": {
         "order_id": "string",
         "user_id": "string",
         "product_ids": ["string"],
         "total_price": "number"
       }
     }
     ```

2. Notification Exchange (Fanout)
   - Name: notification_exchange
   - Type: Fanout
   - Queue: notification_events
   - Events:
     ```json
     {
       "event": "notification.email|notification.sms",
       "timestamp": "ISO-8601-timestamp",
       "data": {
         // For Email
         "to": "email",
         "subject": "string",
         "body": "string",
         "metadata": {}
         // For SMS
         "to": "phone_number",
         "message": "string",
         "metadata": {}
       }
     }
     ```

## Directory Structure

```
src/
├── config/           # Configuration files
│   └── constants.js  # Queue and system constants
├── publishers/       # Message publishers
│   ├── orderPublisher.js
│   └── notificationPublisher.js
├── consumers/        # Message consumers
│   ├── orderConsumer.js
│   └── notificationConsumer.js
├── services/         # Core services
│   ├── emailService.js
│   └── smsService.js
└── examples/         # Example implementations
```

## Component Details

### Publishers

1. OrderPublisher
   - Publishes order events to RabbitMQ
   - Handles order.placed events
   - Ensures proper message format and delivery

2. NotificationPublisher
   - Handles both email and SMS notifications
   - Supports metadata for flexible notification content
   - Ensures proper message delivery to notification exchange

### Consumers

1. OrderConsumer
   - Processes incoming order events
   - Triggers appropriate business logic
   - Updates order status in database
   - Initiates notification events

2. NotificationConsumer
   - Processes both email and SMS notifications
   - Integrates with external services (SendGrid/Mailgun/Amazon SES for email)
   - Handles notification delivery and retries

### Services

1. Email Service
   - Integrates with external email providers
   - Handles email template rendering
   - Manages email delivery and tracking

2. SMS Service
   - Integrates with SMS providers
   - Handles message formatting
   - Manages delivery status

## System Flow

1. Order Flow:
   ```
   User Places Order -> OrderPublisher -> RabbitMQ -> OrderConsumer -> 
   Database Update -> NotificationPublisher -> NotificationConsumer -> 
   Email/SMS Service -> Customer Notification
   ```

2. Notification Flow:
   ```
   Event Trigger -> NotificationPublisher -> RabbitMQ -> 
   NotificationConsumer -> Email/SMS Service -> Delivery
   ```

## External Integrations

1. Email Service Providers:
   - SendGrid
   - Mailgun
   - Amazon SES

2. SMS Service Providers:
   - Integration ready for any provider

## Security Considerations

1. Database:
   - SSL mode enabled for secure connections
   - Proper user authentication and authorization

2. Message Queue:
   - Secure RabbitMQ connections
   - Message acknowledgment for reliability
   - Error handling and retry mechanisms

## Monitoring and Logging

- Console logging implemented for all major operations
- Error tracking and reporting in place
- Ready for integration with monitoring services

## Future Enhancements

1. Add message persistence in RabbitMQ
2. Implement dead letter queues for failed messages
3. Add metrics collection for system monitoring
4. Implement circuit breakers for external service calls
5. Add rate limiting for notifications
