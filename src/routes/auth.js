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

router.get('/me', authenticate, (req, res) => {
    res.json(req.user);
});

module.exports = router;
