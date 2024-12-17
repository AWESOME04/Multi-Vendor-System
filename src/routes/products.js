const express = require('express');
const router = express.Router();
const productService = require('../services/productService');
const { authenticate, authorize } = require('../middleware/auth');

// Search products (public)
router.get('/search', async (req, res) => {
    try {
        const { q, minPrice, maxPrice } = req.query;
        const products = await productService.searchProducts(q, { minPrice, maxPrice });
        res.json(products);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get single product (public)
router.get('/:id', async (req, res) => {
    try {
        const product = await productService.getProduct(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Create product (sellers only)
router.post('/', authenticate, authorize(['seller']), async (req, res) => {
    try {
        const product = await productService.createProduct(req.user.userId, req.body);
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update product (sellers only)
router.put('/:id', authenticate, authorize(['seller']), async (req, res) => {
    try {
        const product = await productService.updateProduct(req.params.id, req.user.userId, req.body);
        if (!product) {
            return res.status(404).json({ message: 'Product not found or unauthorized' });
        }
        res.json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete product (sellers only)
router.delete('/:id', authenticate, authorize(['seller']), async (req, res) => {
    try {
        const product = await productService.deleteProduct(req.params.id, req.user.userId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found or unauthorized' });
        }
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
