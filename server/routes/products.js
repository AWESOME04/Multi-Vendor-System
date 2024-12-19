const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticate, authorize } = require('../middleware/auth');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const { storage } = require('../firebase');
const db = require('../database/db');

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Get all products (public)
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM products ORDER BY created_at DESC');
        res.json({ products: result.rows });
    } catch (error) {
        console.error('Error getting products:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get seller's products
router.get('/seller/:sellerId', authenticate, async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM products WHERE seller_id = $1 ORDER BY created_at DESC',
            [req.user.userId]
        );
        res.json({ products: result.rows });
    } catch (error) {
        console.error('Error getting seller products:', error);
        res.status(500).json({ message: error.message });
    }
});

// Create new product
router.post('/', authenticate, authorize(['seller']), upload.single('image'), async (req, res) => {
    try {
        console.log('Request body:', req.body); // Debug log
        const { title, description, price, stockQuantity, category } = req.body;
        
        // Validate required fields
        if (!title || !description || !price || !stockQuantity || !category) {
            return res.status(400).json({ 
                message: 'Missing required fields',
                received: { title, description, price, stockQuantity, category }
            });
        }

        // Convert price and stockQuantity to numbers
        const numericPrice = parseFloat(price);
        const numericStock = parseInt(stockQuantity);

        if (isNaN(numericPrice) || numericPrice <= 0) {
            return res.status(400).json({ message: 'Invalid price' });
        }

        if (isNaN(numericStock) || numericStock < 0) {
            return res.status(400).json({ message: 'Invalid stock quantity' });
        }

        // Handle image upload to Firebase
        let imageUrl = null;
        if (req.file) {
            try {
                const storageRef = ref(storage, `products/${Date.now()}-${req.file.originalname}`);
                const snapshot = await uploadBytes(storageRef, req.file.buffer);
                imageUrl = await getDownloadURL(snapshot.ref);
            } catch (error) {
                console.error('Error uploading image to Firebase:', error);
                return res.status(400).json({ message: 'Failed to upload image' });
            }
        }

        const result = await db.query(
            `INSERT INTO products (
                title, description, price, stock_quantity, category, 
                image_url, seller_id, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING *`,
            [title, description, numericPrice, numericStock, category, imageUrl, req.user.userId]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(400).json({ message: error.message });
    }
});

// Update product
router.put('/:id', authenticate, authorize(['seller']), upload.single('image'), async (req, res) => {
    try {
        const { title, description, price, stockQuantity, category } = req.body;
        const productId = req.params.id;

        // Check if product exists and belongs to seller
        const checkResult = await db.query(
            'SELECT * FROM products WHERE id = $1 AND seller_id = $2',
            [productId, req.user.userId]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found or unauthorized' });
        }

        const result = await db.query(
            `UPDATE products SET
                title = COALESCE($1, title),
                description = COALESCE($2, description),
                price = COALESCE($3, price),
                stock_quantity = COALESCE($4, stock_quantity),
                category = COALESCE($5, category),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $6 AND seller_id = $7
            RETURNING *`,
            [title, description, price, stockQuantity, category, productId, req.user.userId]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(400).json({ message: error.message });
    }
});

// Delete product
router.delete('/:id', authenticate, authorize(['seller']), async (req, res) => {
    try {
        const result = await db.query(
            'DELETE FROM products WHERE id = $1 AND seller_id = $2 RETURNING *',
            [req.params.id, req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found or unauthorized' });
        }

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
