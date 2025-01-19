# Multi-Vendor Platform - Frontend

![Image](https://github.com/user-attachments/assets/790d36e2-ba0a-421e-af0d-41a782a794ff)

The **Multi-Vendor Platform** frontend is a responsive and user-friendly web application that enables users to browse, search seamlessly, and purchase products listed by multiple sellers. This platform prioritizes scalability, intuitive navigation, and an engaging user experience.

## Features

- **User Account Management**:
  - Secure login and registration using JWT-based authentication.
  - Role-based access control for buyers and sellers.
  
- **Product Management**:
  - Sellers can list, edit, and manage their products.
  - Buyers can browse categories, search for items, and view detailed product pages.
  
- **Shopping and Orders**:
  - Add items to a cart and proceed to checkout.
  - View order history and status updates.
  
- **Notifications**:
  - Real-time notifications for events like order confirmations and updates.
  
- **Search and Filters**:
  - Advanced search functionality with category and price filters for an optimal user experience.

## Technology Stack

- **React.js**: Frontend framework for building the user interface.
- **Custom CSS**: Styling for a responsive and visually appealing design.
- **REST APIs**: Communication with backend services.

## System Overview

The frontend interacts with the backend microservices via an API Gateway, ensuring a decoupled and scalable architecture. It supports efficient state management for consistent and synchronized data across components.

### High-Level Architecture

![Image](https://github.com/user-attachments/assets/0a02303d-9552-4cfb-a0c3-6fb63e592010)

## Installation and Setup

### Prerequisites

Ensure the following are installed on your system:
- **Node.js**: JavaScript runtime environment.
- **npm**: Package manager for handling dependencies.

### Steps to Run Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/AWESOME04/Multi-Vendor-System.git
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Create a `.env` file in the project root.
   - Add the necessary variables (refer to `.env.example`).
4. Start the development server:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

## Deployment

1. Build the production-ready app:
   ```bash
   npm run build
   ```
2. Deploy the app using hosting platforms like Vercel, Netlify, or AWS Amplify:
   - Example: The platform is currently deployed at [Multi-Vendor System](https://multi-vendor-system.vercel.app/).

## API Integration

The application communicates with backend services for functionalities such as authentication, product management, and order handling. For API documentation, refer to the provided Postman collection.

## Contributing

- Follow Git branching strategies:
  - **`main`**: Stable production code.
  - **`develop`**: Latest development updates.
  - **`feature/<feature-name>`**: Specific feature development.
- Before submitting a pull request, ensure all changes are tested.

## Screenshots

![Product Details](https://github.com/user-attachments/assets/8ffe9515-8678-459e-9b10-20784a92f702)


![Cart Page](https://github.com/user-attachments/assets/d0773bde-ec4c-4f3f-b687-a22ef5c3bc07)
