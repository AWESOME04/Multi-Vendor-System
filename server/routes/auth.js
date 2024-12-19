const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const { authenticate } = require('../middleware/auth');

router.post('/register', async (req, res) => {
    try {
        const { email, password, role } = req.body;
        const user = await authService.register(email, password, role);
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await authService.login(email, password);
        res.json(result);
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
});

router.get('/me', authenticate, async (req, res) => {
    try {
        const user = await authService.getUserById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({
            id: user.id,
            email: user.email,
            role: user.role
        });
    } catch (error) {
        console.error('Error in /me endpoint:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
