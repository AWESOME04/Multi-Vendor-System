# Multi-Vendor Platform

Welcome to the Multi-Vendor Platform project! This project involves developing a web-based multi-vendor platform where sellers can list their products, and users can search for items and place orders. The system is built using a microservices architecture, ensuring scalability and extensibility.

## Project Overview

The platform comprises the following core functionalities:

- Sellers can register, log in, and upload items for sale.
- Users can search for items, view details, and place orders.
- Notifications (email, SMS, push, etc.) are sent to sellers and users for key events.

The system is designed as a modular application with the following microservices:

1. **Authentication Service**: Handles user registration, login, and role-based access.
2. **Product Service**: Manages product listings and search functionality.
3. **Search Service**: Provides advanced item search capabilities.
4. **Order Service**: Handles order placement and processing.
5. **Notification Service**: Sends notifications via email and other channels.

## System Architecture

The platform uses a microservices architecture, with each service operating independently. The services communicate using RabbitMQ/Kafka message queues and are exposed via an API Gateway.

![System Architecture](system-architecture-diagram.png)

## Database Structures

Each microservice has its own database schema:

- **Authentication Service**: 
  - `Users` table: `user_id`, `email`, `password_hash`, `roles`, etc.

- **Product Service**: 
  - `Products` table: `product_id`, `seller_id`, `title`, `description`, `price`, `image_url`, `stock_quantity`, etc.

- **Order Service**: 
  - `Orders` table: `order_id`, `user_id`, `product_id`, `order_status`, `timestamp`, etc.

## Message Queues and Payloads

- **Order_Placed Queue**:
  - Payload Example:
    ```json
    {
      "order_id": "12345",
      "user_id": "67890",
      "product_ids": ["101", "102"],
      "total_price": 49.99,
      "timestamp": "2024-12-05T10:30:00Z"
    }
    ```

- **Notification Queue**:
  - Payload Example:
    ```json
    {
      "event": "send_email",
      "recipient": "user@example.com",
      "subject": "Order Confirmation",
      "message": "Your order #12345 has been placed."
    }
    ```

## External APIs

- **Email Notification Service**: Integrate with providers like SendGrid, Mailgun, or Amazon SES for sending emails.

## Repositories

Each microservice has its own GitHub repository:

- [Authentication Service](#)
- [Product Service](#)
- [Search Service](#)
- [Order Service](#)
- [Notification Service](#)

## Setup Instructions

### Prerequisites

- Node.js
- Docker
- PostgreSQL/MySQL
- RabbitMQ/Kafka

### Getting Started

1. Clone the repository for each microservice.
2. Set up environment variables using `.env` files.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the services locally:
   ```bash
   npm start
   ```
5. Deploy services using Docker Compose (if applicable).

### API Documentation

Use Swagger or Postman to explore the available endpoints. Import the provided `postman_collection.json` to view all endpoints in Postman.

## Testing and Deployment

1. Run unit tests for each service:
   ```bash
   npm test
   ```
2. Deploy services to your preferred hosting platform (e.g., AWS, Azure, or GCP).

## Contributing

Follow the branching strategy for collaboration:

- `main`: Production-ready code.
- `develop`: Integration branch.
- `feature/<feature-name>`: Feature development.

## License

This project is licensed under the MIT License.

---

**Deadline Reminder**: Submit Task 1 deliverables, including your database structures, message payloads, APIs, and system architecture, by **9th December 2024**.
