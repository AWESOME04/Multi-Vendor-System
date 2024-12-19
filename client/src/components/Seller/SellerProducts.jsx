import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import './SellerProducts.css';

const SellerProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth(); 
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (user && token) {
      fetchSellerProducts();
    }
  }, [user, token]);

  const fetchSellerProducts = async () => {
    try {
      if (!user || !token) {
        setLoading(false);
        return;
      }

      const response = await axios.get(`http://localhost:3000/api/products/seller/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching seller products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await axios.delete(`http://localhost:3000/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchSellerProducts(); // Refresh the list
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleUpdate = async (productId, updatedData) => {
    try {
      const formData = new FormData();
      Object.keys(updatedData).forEach(key => {
        formData.append(key, updatedData[key]);
      });

      await axios.put(`http://localhost:3000/api/products/${productId}`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      fetchSellerProducts(); // Refresh the list
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="seller-products">
      <h2>My Products</h2>
      <div className="products-grid">
        {products.map((product) => (
          <div key={product.product_id} className="product-card">
            <img src={product.image_url} alt={product.title} />
            <h3>{product.title}</h3>
            <p>{product.description}</p>
            <p>Price: ${product.price}</p>
            <p>Stock: {product.stock_quantity}</p>
            <div className="product-actions">
              <button onClick={() => handleDelete(product.product_id)}>Delete</button>
              <button onClick={() => {
                // Here you can implement a modal or form for updating
                const updatedData = {
                  title: prompt('Enter new title:', product.title),
                  price: prompt('Enter new price:', product.price),
                  stock_quantity: prompt('Enter new stock quantity:', product.stock_quantity)
                };
                if (updatedData.title && updatedData.price && updatedData.stock_quantity) {
                  handleUpdate(product.product_id, updatedData);
                }
              }}>Update</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SellerProducts;
