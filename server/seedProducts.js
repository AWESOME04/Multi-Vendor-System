const { Pool } = require('pg');

// Configure the database connection using your Neon.tech connection string
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:X97aZyTnljwf@ep-withered-surf-a5fjx61s.us-east-2.aws.neon.tech/neondb?sslmode=require',
});

const seedProducts = async () => {
  const clearQuery = `
    DELETE FROM products;
  `;

  const insertQuery = `
    INSERT INTO products (seller_id, title, description, price, image_url, stock_quantity, category, created_at, updated_at)
    VALUES
    (2, 'Premium Headphones', 'High-quality wireless headphones with noise cancellation', 299.00, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', 50, 'Electronics', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (2, 'Gaming Headset', 'Professional gaming headset with surround sound', 199.00, 'https://images.unsplash.com/photo-1599669454699-248893623440?w=500', 75, 'Electronics', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (2, 'Wireless Earbuds', 'True wireless earbuds with long battery life', 159.00, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500', 100, 'Electronics', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (2, 'Studio Headphones', 'Professional studio headphones for audio production', 349.00, 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500', 25, 'Electronics', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (2, 'Sports Headphones', 'Sweat-resistant headphones for workouts', 129.00, 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500', 150, 'Electronics', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (2, 'Kids Headphones', 'Volume-limited headphones safe for children', 49.00, 'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=500', 200, 'Electronics', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
  `;

  try {
    // Clear existing data
    await pool.query(clearQuery);
    console.log('Existing products cleared.');

    // Insert new data
    await pool.query(insertQuery);
    console.log('Products seeded successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    pool.end();
  }
};

// Run the seed script
seedProducts();
