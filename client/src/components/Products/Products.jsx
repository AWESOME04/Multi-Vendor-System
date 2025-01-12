import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import * as api from '@/services/api';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.getProducts();
      if (response && response.data && response.data.products) {
        const productData = response.data.products;
        setProducts(productData.map(product => ({
          ...product,
          id: product.id,
          name: product.name,
          description: product.desc,
          price: product.price,
          image: product.img,
          stock_quantity: product.stock
        })));
      } else {
        setProducts([]);
        toast.error('No products found');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOrder = async (productId) => {
    try {
      await api.createOrder(productId);
      toast.success('Order placed successfully!');
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order');
    }
  };

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  return (
    <div className="products-container">
      <h2>Our Products</h2>
      <div className="products-grid">
        {products.map((product) => (
          <div key={product._id} className="product-card">
            {product.img && (
              <img src={product.img} alt={product.name} className="product-image" />
            )}
            <div className="product-info">
              <h3>{product.name}</h3>
              <p>{product.desc}</p>
              <p className="product-type">{product.type}</p>
              <p className="product-price">${product.price.toFixed(2)}</p>
              <p className="product-stock">In Stock: {product.stock}</p>
              {user && user.role === 'BUYER' && (
                <button
                  className="order-button"
                  onClick={() => handleOrder(product._id)}
                  disabled={!product.available || product.stock < 1}
                >
                  Order Now
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;
