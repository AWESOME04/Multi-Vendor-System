const db = require('../database/db');

class ProductService {
    async createProduct(sellerId, productData) {
        const query = `
            INSERT INTO products (seller_id, title, description, price, image_url, stock_quantity)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        
        const values = [
            sellerId,
            productData.title,
            productData.description,
            productData.price,
            productData.imageUrl,
            productData.stockQuantity
        ];

        const result = await db.query(query, values);
        return result.rows[0];
    }

    async getProduct(productId) {
        const query = 'SELECT * FROM products WHERE product_id = $1';
        const result = await db.query(query, [productId]);
        return result.rows[0];
    }

    async searchProducts(searchTerm, filters = {}) {
        let query = `
            SELECT * FROM products 
            WHERE title ILIKE $1 
            OR description ILIKE $1
        `;
        
        const values = [`%${searchTerm}%`];
        let paramCount = 2;

        if (filters.minPrice) {
            query += ` AND price >= $${paramCount}`;
            values.push(filters.minPrice);
            paramCount++;
        }

        if (filters.maxPrice) {
            query += ` AND price <= $${paramCount}`;
            values.push(filters.maxPrice);
            paramCount++;
        }

        const result = await db.query(query, values);
        return result.rows;
    }

    async updateProduct(productId, sellerId, updates) {
        const query = `
            UPDATE products 
            SET title = COALESCE($1, title),
                description = COALESCE($2, description),
                price = COALESCE($3, price),
                image_url = COALESCE($4, image_url),
                stock_quantity = COALESCE($5, stock_quantity),
                updated_at = CURRENT_TIMESTAMP
            WHERE product_id = $6 AND seller_id = $7
            RETURNING *
        `;

        const values = [
            updates.title,
            updates.description,
            updates.price,
            updates.imageUrl,
            updates.stockQuantity,
            productId,
            sellerId
        ];

        const result = await db.query(query, values);
        return result.rows[0];
    }

    async deleteProduct(productId, sellerId) {
        const query = 'DELETE FROM products WHERE product_id = $1 AND seller_id = $2 RETURNING *';
        const result = await db.query(query, [productId, sellerId]);
        return result.rows[0];
    }
}

module.exports = new ProductService();
