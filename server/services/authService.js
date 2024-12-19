const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/db');

class AuthService {
    async register(email, password, role) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = `
            INSERT INTO users (email, password_hash, role)
            VALUES ($1, $2, $3)
            RETURNING id, email, role
        `;
        
        try {
            const result = await db.query(query, [email, hashedPassword, role]);
            return result.rows[0];
        } catch (error) {
            if (error.code === '23505') { // Unique violation
                throw new Error('Email already exists');
            }
            throw error;
        }
    }

    async login(email, password) {
        const query = 'SELECT * FROM users WHERE email = $1';
        const result = await db.query(query, [email]);
        const user = result.rows[0];

        if (!user || !await bcrypt.compare(password, user.password_hash)) {
            throw new Error('Invalid credentials');
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        return { 
            token, 
            user: { 
                id: user.id, 
                email: user.email, 
                role: user.role 
            } 
        };
    }

    verifyToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            throw new Error('Invalid token');
        }
    }

    async getUserById(userId) {
        const query = 'SELECT id, email, role FROM users WHERE id = $1';
        const result = await db.query(query, [userId]);
        return result.rows[0];
    }
}

module.exports = new AuthService();
