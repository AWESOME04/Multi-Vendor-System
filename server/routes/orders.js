const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const orderService = require('../services/orderService');

// Create a new order
router.post('/', authenticate, async (req, res) => {
    try {
        const order = await orderService.createOrder(req.user.userId, req.body.items);
        res.status(201).json(order);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(400).json({ message: error.message });
    }
});

// Get all orders for current user
router.get('/', authenticate, async (req, res) => {
    try {
        const orders = await orderService.getUserOrders(req.user.userId);
        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: error.message });
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
        console.error('Error fetching order:', error);
        res.status(500).json({ message: error.message });
    }
});

// Update order status
router.put('/:id', authenticate, async (req, res) => {
    try {
        const order = await orderService.updateOrderStatus(req.params.id, req.user.userId, req.body.status);
        res.json(order);
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(400).json({ message: error.message });
    }
});

// Delete order
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const result = await orderService.deleteOrder(req.params.id, req.user.userId);
        res.json(result);
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
