import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import * as api from '@/services/api';
import './SellerProductsView.css';

const SellerProductsView = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isSeller } = useAuth();

  useEffect(() => {
    if (!isSeller) {
      window.location.href = '/';
      return;
    }
    
    fetchSellerProducts();
  }, [isSeller]);

  const fetchSellerProducts = async () => {
    try {
      const { data } = await api.getSellerProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching seller products:', error);
      toast.error('Failed to load your products');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading your products...</div>;
  }

  return (
    <div className="seller-products">
      <h1>My Products</h1>
      {products.length === 0 ? (
        <p className="no-products">You haven't added any products yet.</p>
      ) : (
        <div className="products-grid">
          {products.map(product => (
            <div key={product.id} className="product-card">
              <img 
                src={product.image_url} 
                alt={product.title} 
                className="product-image"
              />
              <div className="product-info">
                <h3>{product.title}</h3>
                <p className="description">{product.description}</p>
                <div className="details">
                  <span className="price">${product.price}</span>
                  <span className="stock">Stock: {product.stock_quantity}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerProductsView;
