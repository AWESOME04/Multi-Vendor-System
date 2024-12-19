const express = require('express');
const cors = require('cors');
require('dotenv').config();
const rabbitmq = require('./config/rabbitmq');

const app = express();
app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');

async function startServer() {
    try {
        // Connect to RabbitMQ
        const channel = await rabbitmq.connect();
        console.log('RabbitMQ connected successfully');

        app.use('/api/auth', authRoutes);
        app.use('/api/products', productRoutes);
        app.use('/api/orders', orderRoutes);

        app.get('/', (req, res) => {
            res.json({ message: 'This is the entry point for the Multi-Vendor System API' });
        });

        app.use((err, req, res, next) => {
            console.error(err.stack);
            res.status(500).json({ message: 'Something went wrong!' });
        });

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();

module.exports = { app };
