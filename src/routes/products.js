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

// Search products (public)
router.get('/search', async (req, res) => {
    try {
        const { q, minPrice, maxPrice, page = 1, limit = 10 } = req.query;

        // Use Elasticsearch for search if query is provided
        if (q) {
            const { body } = await esClient.search({
                index: 'products',
                body: {
                    from: (page - 1) * limit,
                    size: limit,
                    query: {
                        bool: {
                            must: [
                                {
                                    multi_match: {
                                        query: q,
                                        fields: ['title^2', 'description']
                                    }
                                }
                            ],
                            filter: [
                                minPrice && {
                                    range: {
                                        price: { gte: minPrice }
                                    }
                                },
                                maxPrice && {
                                    range: {
                                        price: { lte: maxPrice }
                                    }
                                }
                            ].filter(Boolean)
                        }
                    }
                }
            });

            const hits = body.hits.hits;
            const total = body.hits.total.value;

            res.json({
                products: hits.map(hit => ({
                    ...hit._source,
                    score: hit._score
                })),
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalProducts: total
            });
        } else {
            // Use regular SQL if no search query
            let query = 'SELECT * FROM products WHERE 1=1';
            const params = [];
            let paramCount = 1;

            if (minPrice) {
                query += ` AND price >= $${paramCount}`;
                params.push(minPrice);
                paramCount++;
            }

            if (maxPrice) {
                query += ` AND price <= $${paramCount}`;
                params.push(maxPrice);
                paramCount++;
            }

            query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
            params.push(limit, (page - 1) * limit);

            const result = await db.query(query, params);
            const countResult = await db.query('SELECT COUNT(*) FROM products');
            const totalProducts = parseInt(countResult.rows[0].count);

            res.json({
                products: result.rows,
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalProducts / limit),
                totalProducts
            });
        }
    } catch (error) {
        console.error('Error searching products:', error);
        res.status(400).json({ message: error.message });
    }
});

// Get single product (public)
router.get('/:id', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM products WHERE product_id = $1',
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Create product (sellers only)
router.post('/', authenticate, authorize(['seller']), upload.single('image'), async (req, res) => {
    try {
        const { title, description, price, stockQuantity } = req.body;
        let imageUrl = null;

        if (req.file) {
            try {
                // Create file metadata including the content type
                const metadata = {
                    contentType: req.file.mimetype,
                };

                // Create a unique filename
                const filename = `${Date.now()}-${req.file.originalname}`;
                const storageRef = ref(storage, `products/${filename}`);

                // Upload the file and metadata
                const snapshot = await uploadBytes(storageRef, req.file.buffer, metadata);
                imageUrl = await getDownloadURL(snapshot.ref);
                console.log('File uploaded successfully:', imageUrl);
            } catch (error) {
                console.error('Error uploading file:', error);
                return res.status(500).json({ message: 'Error uploading image to Firebase' });
            }
        }

        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');

            const result = await client.query(
                `INSERT INTO products (seller_id, title, description, price, image_url, stock_quantity)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *`,
                [req.user.userId, title, description, price, imageUrl, stockQuantity]
            );

            const product = result.rows[0];

            // Index product in Elasticsearch
            await esClient.index({
                index: 'products',
                id: product.product_id.toString(),
                body: {
                    productId: product.product_id,
                    title: product.title,
                    description: product.description,
                    price: product.price,
                    imageUrl: product.image_url,
                    stockQuantity: product.stock_quantity,
                    sellerId: product.seller_id,
                    createdAt: product.created_at
                }
            });

            await client.query('COMMIT');
            res.status(201).json(product);
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error creating product:', error);
            res.status(400).json({ message: error.message });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ message: 'Error creating product' });
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
            try {
                // Create file metadata including the content type
                const metadata = {
                    contentType: req.file.mimetype,
                };

                // Create a unique filename
                const filename = `${Date.now()}-${req.file.originalname}`;
                const storageRef = ref(storage, `products/${filename}`);

                // Upload the file and metadata
                const snapshot = await uploadBytes(storageRef, req.file.buffer, metadata);
                imageUrl = await getDownloadURL(snapshot.ref);
                console.log('File uploaded successfully:', imageUrl);
            } catch (error) {
                console.error('Error uploading file:', error);
                return res.status(500).json({ message: 'Error uploading image to Firebase' });
            }
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

        const product = result.rows[0];

        // Update product in Elasticsearch
        await esClient.update({
            index: 'products',
            id: product.product_id.toString(),
            body: {
                doc: {
                    title: product.title,
                    description: product.description,
                    price: product.price,
                    imageUrl: product.image_url,
                    stockQuantity: product.stock_quantity,
                    updatedAt: product.updated_at
                }
            }
        });

        await client.query('COMMIT');
        res.json(product);
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

        // Delete product from Elasticsearch
        await esClient.delete({
            index: 'products',
            id: req.params.id.toString()
        });

        // Delete the product (cascade will handle order_items)
        await client.query('DELETE FROM products WHERE product_id = $1', [req.params.id]);

        await client.query('COMMIT');
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error deleting product:', error);
        res.status(400).json({ message: error.message });
    } finally {
        client.release();
    }
});

module.exports = router;
