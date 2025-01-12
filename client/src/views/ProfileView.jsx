import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { productApi } from '@/config/api';
import { toast } from 'react-toastify';
import './ProfileView.css';

const ProfileView = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [sellerProducts, setSellerProducts] = useState([]);

  useEffect(() => {
    const fetchSellerProducts = async () => {
      if (user?.role?.toUpperCase() === 'SELLER') {
        try {
          setLoading(true);
          const productsRes = await productApi.get('/');
          const products = productsRes?.data?.products || productsRes?.data?.data?.products || [];
          const filteredProducts = products.filter(
            product => product.seller === user.id
          );
          setSellerProducts(filteredProducts);
        } catch (error) {
          console.error('Error fetching seller products:', error);
          toast.error('Failed to load products');
          setSellerProducts([]);
        } finally {
          setLoading(false);
        }
      }
    };

    if (user) {
      fetchSellerProducts();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="profile-container">
        <h2>Please login to view your profile</h2>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="profile-container">
        <h2>Loading profile...</h2>
      </div>
    );
  }

  const isSeller = user.role?.toUpperCase() === 'SELLER';

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>Profile</h2>
        <div className="user-info">
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
          {/* Add any other user details you want to display */}
        </div>
      </div>

      {isSeller && (
        <div className="profile-content">
          <div className="products-section">
            <h3>My Products</h3>
            {sellerProducts.length === 0 ? (
              <div className="no-products">
                <p>You haven't posted any products yet</p>
              </div>
            ) : (
              <div className="products-grid">
                {sellerProducts.map(product => (
                  <div key={product.id} className="product-card">
                    <img 
                      src={product.img || '/placeholder.png'} 
                      alt={product.name}
                      className="product-image"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder.png';
                      }}
                    />
                    <div className="product-details">
                      <h4>{product.name}</h4>
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
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileView;
