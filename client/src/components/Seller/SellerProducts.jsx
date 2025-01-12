import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { productApi } from '@/config/api';
import { toast } from 'react-toastify';
import './SellerProducts.css';

const SellerProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchSellerProducts();
    }
  }, [user]);

  const fetchSellerProducts = async () => {
    try {
      const response = await productApi.get('/');
      const allProducts = response?.data?.products || response?.data?.data?.products || [];
      // Filter products for the current seller
      const sellerProducts = allProducts.filter(product => product.seller === user.id);
      setProducts(sellerProducts);
    } catch (error) {
      console.error('Error fetching seller products:', error);
      toast.error('Failed to load your products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading your products...</div>;
  }

  return (
    <div className="seller-products">
      <h2>My Products</h2>
      {products.length === 0 ? (
        <div className="no-products">
          <p>You haven't posted any products yet</p>
          <button className="add-product-btn">Add Your First Product</button>
        </div>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <img 
                src={product.img || '/placeholder.png'} 
                alt={product.name} 
                className="product-image"
              />
              <div className="product-details">
                <h3>{product.name}</h3>
                <p>{product.desc}</p>
                <div className="product-info">
                  <span className="price">${product.price}</span>
                  <span className="stock">Stock: {product.stock}</span>
                </div>
                <div className="product-status">
                  <span className={`status ${product.available ? 'active' : 'inactive'}`}>
                    {product.available ? 'Available' : 'Out of Stock'}
                  </span>
                </div>
                <div className="product-actions">
                  <button 
                    className="delete-btn"
                    onClick={() => {
                      // Delete functionality will be implemented later
                      toast.info('Delete functionality coming soon');
                    }}
                  >
                    Delete
                  </button>
                  <button 
                    className="edit-btn"
                    onClick={() => {
                      // Edit functionality will be implemented later
                      toast.info('Edit functionality coming soon');
                    }}
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerProducts;
