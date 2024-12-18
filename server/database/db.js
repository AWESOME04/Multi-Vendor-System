const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // ssl: {
    //     rejectUnauthorized: false // This allows connecting to Neon.tech with self-signed certificates
    // }
});

// Test the database connection
pool.connect((err, client, release) => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
    } else {
        console.log('Successfully connected to database');
        release();
    }
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool
};
