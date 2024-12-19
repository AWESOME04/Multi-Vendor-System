const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const orderService = require('../services/orderService');

// Create a new order
router.post('/', authenticate, async (req, res) => {
    try {
        const order = await orderService.createOrder(req.user.id, req.body.items);
        res.status(201).json(order);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(400).json({ message: error.message });
    }
});

// Get current user's orders
router.get('/my-orders', authenticate, async (req, res) => {
    try {
        const orders = await orderService.getUserOrders(req.user.id);
        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get specific order
router.get('/:id', authenticate, async (req, res) => {
    try {
        const orderId = parseInt(req.params.id);
        if (isNaN(orderId)) {
            return res.status(400).json({ message: 'Invalid order ID' });
        }
        const order = await orderService.getOrder(orderId, req.user.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ message: error.message });
    }
});

// Update order status
router.put('/:id', authenticate, async (req, res) => {
    try {
        const orderId = parseInt(req.params.id);
        if (isNaN(orderId)) {
            return res.status(400).json({ message: 'Invalid order ID' });
        }
        const order = await orderService.updateOrderStatus(orderId, req.user.id, req.body.status);
        res.json(order);
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(400).json({ message: error.message });
    }
});

// Delete order
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const orderId = parseInt(req.params.id);
        if (isNaN(orderId)) {
            return res.status(400).json({ message: 'Invalid order ID' });
        }
        await orderService.deleteOrder(orderId, req.user.id);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
