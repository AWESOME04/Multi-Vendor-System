const express = require('express');
const router = express.Router();
const orderService = require('../services/orderService');
const { authenticate } = require('../middleware/auth');

// Create order
router.post('/', authenticate, async (req, res) => {
    try {
        const order = await orderService.createOrder(req.user.userId, req.body.items);
        res.status(201).json(order);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get user's orders
router.get('/', authenticate, async (req, res) => {
    try {
        const orders = await orderService.getUserOrders(req.user.userId);
        res.json(orders);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get specific order
router.get('/:id', authenticate, async (req, res) => {
    try {
        const order = await orderService.getOrder(req.params.id, req.user.userId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(order);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update order status
router.put('/:id', authenticate, async (req, res) => {
    try {
        const order = await orderService.updateOrder(req.params.id, req.user.userId, req.body);
        res.json(order);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete order
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const orderId = req.params.id;
        const userId = req.user.id;

        // First check if order exists and belongs to user
        const order = await orderService.getOrder(req.params.id, req.user.userId);

        if (!order) {
            return res.status(404).json({ message: 'Order not found or cannot be deleted' });
        }

        // Delete order items first
        await orderService.deleteOrderItems(orderId);

        // Then delete the order
        const result = await orderService.deleteOrder(orderId, userId);
        res.json({ message: 'Order deleted successfully' });
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ message: 'Error deleting order' });
    }
});

module.exports = router;
