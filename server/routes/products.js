const express = require('express');
const router = express.Router();
const multer = require('multer');
const { Client } = require('@elastic/elasticsearch');
const { authenticate, authorize } = require('../middleware/auth');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const { storage } = require('../firebase');
const db = require('../database/db');

// Configure Elasticsearch
const esClient = new Client({ node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200' });

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
        const { page = 1, limit = 10, sort = 'created_at', order = 'DESC' } = req.query;
        const offset = (page - 1) * limit;

        const result = await db.query(
            `SELECT * FROM products 
            ORDER BY ${sort} ${order}
            LIMIT $1 OFFSET $2`,
            [limit, offset]
        );
        
        // Get total count
        const countResult = await db.query('SELECT COUNT(*) FROM products');
        const totalProducts = parseInt(countResult.rows[0].count);

        res.json({
            products: result.rows,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalProducts / limit),
            totalProducts
        });
    } catch (error) {
        console.error('Error getting products:', error);
        res.status(400).json({ message: error.message });
    }
});

// Get seller's products
router.get('/seller/:sellerId', authenticate, async (req, res) => {
    try {
        const sellerId = parseInt(req.params.sellerId);
        if (isNaN(sellerId)) {
            return res.status(400).json({ message: 'Invalid seller ID' });
        }

        const result = await db.query(
            'SELECT * FROM products WHERE seller_id = $1 ORDER BY created_at DESC',
            [sellerId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error getting seller products:', error);
        res.status(400).json({ message: error.message });
    }
});

// Search products (public)
router.get('/search', async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        const { body } = await esClient.search({
            index: 'products',
            body: {
                query: {
                    multi_match: {
                        query,
                        fields: ['title', 'description', 'category']
                    }
                }
            }
        });

        const hits = body.hits.hits.map(hit => ({
            id: hit._id,
            ...hit._source
        }));

        res.json(hits);
    } catch (error) {
        console.error('Error searching products:', error);
        res.status(400).json({ message: error.message });
    }
});

// Get single product (public)
router.get('/:id', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM products WHERE id = $1',
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error getting product:', error);
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
            const storageRef = ref(storage, `products/${Date.now()}-${req.file.originalname}`);
            const snapshot = await uploadBytes(storageRef, req.file.buffer);
            imageUrl = await getDownloadURL(snapshot.ref);
        }

        const { title, description, price, stockQuantity, category } = req.body;
        
        // Validate required fields
        if (!title || !description || !price || !stockQuantity || !category) {
            throw new Error('Missing required fields');
        }

        // Convert price and stockQuantity to numbers
        const numericPrice = parseFloat(price);
        const numericStock = parseInt(stockQuantity);

        if (isNaN(numericPrice) || isNaN(numericStock)) {
            throw new Error('Invalid price or stock quantity');
        }

        const result = await client.query(
            `INSERT INTO products (
                title, description, price, stock_quantity, category, 
                image_url, seller_id, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING *`,
            [title, description, numericPrice, numericStock, category, imageUrl, req.user.id]
        );

        // Index in Elasticsearch
        await esClient.index({
            index: 'products',
            id: result.rows[0].id.toString(),
            body: {
                title,
                description,
                category,
                price: numericPrice,
                stockQuantity: numericStock,
                imageUrl,
                sellerId: req.user.id
            }
        });

        await client.query('COMMIT');
        res.status(201).json(result.rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating product:', error);
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
        const productCheck = await client.query(
            'SELECT * FROM products WHERE id = $1 AND seller_id = $2',
            [req.params.id, req.user.id]
        );

        if (productCheck.rows.length === 0) {
            throw new Error('Product not found or unauthorized');
        }

        let imageUrl = productCheck.rows[0].image_url;
        if (req.file) {
            const storageRef = ref(storage, `products/${Date.now()}-${req.file.originalname}`);
            const snapshot = await uploadBytes(storageRef, req.file.buffer);
            imageUrl = await getDownloadURL(snapshot.ref);
        }

        const { title, description, price, stockQuantity, category } = req.body;
        const numericPrice = price ? parseFloat(price) : productCheck.rows[0].price;
        const numericStock = stockQuantity ? parseInt(stockQuantity) : productCheck.rows[0].stock_quantity;

        if (isNaN(numericPrice) || isNaN(numericStock)) {
            throw new Error('Invalid price or stock quantity');
        }

        const result = await client.query(
            `UPDATE products 
            SET title = COALESCE($1, title),
                description = COALESCE($2, description),
                price = $3,
                stock_quantity = $4,
                category = COALESCE($5, category),
                image_url = $6,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $7 AND seller_id = $8
            RETURNING *`,
            [title, description, numericPrice, numericStock, category, imageUrl, req.params.id, req.user.id]
        );

        // Update in Elasticsearch
        await esClient.update({
            index: 'products',
            id: req.params.id.toString(),
            body: {
                doc: {
                    title,
                    description,
                    category,
                    price: numericPrice,
                    stockQuantity: numericStock,
                    imageUrl
                }
            }
        });

        await client.query('COMMIT');
        res.json(result.rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating product:', error);
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
        const productCheck = await client.query(
            'SELECT * FROM products WHERE id = $1 AND seller_id = $2',
            [req.params.id, req.user.id]
        );

        if (productCheck.rows.length === 0) {
            throw new Error('Product not found or unauthorized');
        }

        // Delete from database
        await client.query(
            'DELETE FROM products WHERE id = $1 AND seller_id = $2',
            [req.params.id, req.user.id]
        );

        // Delete from Elasticsearch
        await esClient.delete({
            index: 'products',
            id: req.params.id.toString()
        });

        await client.query('COMMIT');
        res.status(204).send();
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error deleting product:', error);
        res.status(400).json({ message: error.message });
    } finally {
        client.release();
    }
});

module.exports = router;
