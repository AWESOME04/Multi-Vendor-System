const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticate, authorize } = require('../middleware/auth');
const { uploadImage } = require('../firebase');
const productService = require('../services/productService');
const db = require('../database/db');

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

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
router.post('/', authenticate, authorize(['seller']), upload.single('image'), async (req, res) => {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        let imageUrl = null;
        if (req.file) {
            const path = `products/${Date.now()}_${req.file.originalname}`;
            imageUrl = await uploadImage(req.file.buffer, path);
        }

        const result = await client.query(
            `INSERT INTO products (seller_id, title, description, price, image_url, stock_quantity)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *`,
            [req.user.userId, req.body.title, req.body.description, req.body.price, imageUrl, req.body.stockQuantity]
        );

        await client.query('COMMIT');
        res.status(201).json(result.rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        res.status(400).json({ message: error.message });
    } finally {
        client.release();
    }
});

// Update product (sellers only)
router.put('/:id', authenticate, authorize(['seller']), upload.single('image'), async (req, res) => {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        // Check if product exists and belongs to seller
        const productResult = await client.query(
            'SELECT * FROM products WHERE product_id = $1 AND seller_id = $2',
            [req.params.id, req.user.userId]
        );

        if (productResult.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found or unauthorized' });
        }

        let imageUrl = productResult.rows[0].image_url;
        if (req.file) {
            const path = `products/${Date.now()}_${req.file.originalname}`;
            imageUrl = await uploadImage(req.file.buffer, path);
        }

        const result = await client.query(
            `UPDATE products 
            SET title = COALESCE($1, title),
                description = COALESCE($2, description),
                price = COALESCE($3, price),
                image_url = COALESCE($4, image_url),
                stock_quantity = COALESCE($5, stock_quantity),
                updated_at = CURRENT_TIMESTAMP
            WHERE product_id = $6 AND seller_id = $7
            RETURNING *`,
            [
                req.body.title,
                req.body.description,
                req.body.price,
                imageUrl,
                req.body.stockQuantity,
                req.params.id,
                req.user.userId
            ]
        );

        await client.query('COMMIT');
        res.json(result.rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        res.status(400).json({ message: error.message });
    } finally {
        client.release();
    }
});

// Delete product (sellers only)
router.delete('/:id', authenticate, authorize(['seller']), async (req, res) => {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        // Check if product exists and belongs to seller
        const productResult = await client.query(
            'SELECT * FROM products WHERE product_id = $1 AND seller_id = $2',
            [req.params.id, req.user.userId]
        );

        if (productResult.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found or unauthorized' });
        }

        // Check if product is in any pending orders
        const pendingOrdersResult = await client.query(
            `SELECT COUNT(*) FROM order_items oi
            JOIN orders o ON oi.order_id = o.order_id
            WHERE oi.product_id = $1 AND o.status = 'pending'`,
            [req.params.id]
        );

        if (parseInt(pendingOrdersResult.rows[0].count) > 0) {
            throw new Error('Cannot delete product with pending orders');
        }

        // Delete the product (cascade will handle order_items)
        await client.query('DELETE FROM products WHERE product_id = $1', [req.params.id]);

        await client.query('COMMIT');
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        res.status(400).json({ message: error.message });
    } finally {
        client.release();
    }
});

module.exports = router;
