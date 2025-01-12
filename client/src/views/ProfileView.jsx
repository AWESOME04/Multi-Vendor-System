import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { productApi, shoppingApi } from '@/config/api';
import './ProfileView.css';

const ProfileView = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [sellerProducts, setSellerProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Check user role (case insensitive)
      const isSeller = user.role?.toUpperCase() === 'SELLER';
      
      if (isSeller) {
        // Fetch seller's products
        const productsRes = await productApi.get('/');
        // Check the response structure and safely access products
        const products = productsRes?.data?.products || productsRes?.data?.data?.products || [];
        // Filter products by seller ID
        const filteredProducts = products.filter(
          product => product.seller === user.id
        );
        setSellerProducts(filteredProducts);
      } else {
        // Fetch buyer's orders
        const ordersRes = await shoppingApi.get('/orders');
        setOrders(ordersRes?.data?.data || ordersRes?.data || []);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Set empty arrays as fallback
      isSeller ? setSellerProducts([]) : setOrders([]);
    } finally {
      setLoading(false);
    }
  };

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
        </div>
      </div>

      <div className="profile-content">
        {isSeller ? (
          // Seller View
          <div className="products-section">
            <h3>My Products</h3>
            {sellerProducts.length === 0 ? (
              <div className="no-products">
                <p>You haven't posted any products yet</p>
                {/* Optional: Add a button to add products */}
                {/* <button className="add-product-btn">Add Your First Product</button> */}
              </div>
            ) : (
              <div className="products-grid">
                {sellerProducts.map(product => (
                  <div key={product.id} className="product-card">
                    <img 
                      src={product.img || '/placeholder.png'} 
                      alt={product.name}
                      className="product-image"
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
        ) : (
          // Buyer View
          <div className="orders-section">
            <h3>My Orders</h3>
            {orders.length === 0 ? (
              <div className="no-orders">
                <p>You haven't placed any orders yet</p>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map(order => (
                  <div key={order.id} className="order-card">
                    <div className="order-header">
                      <h4>Order #{order.orderId}</h4>
                      <span className={`status status-${order.status}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="order-items">
                      {order.items.map((item, index) => (
                        <div key={index} className="order-item">
                          <div className="item-details">
                            <p>{item.name}</p>
                            <p>Quantity: {item.quantity}</p>
                            <p>Price: ${item.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="order-footer">
                      <p>Total: ${order.amount}</p>
                      <p>Ordered on: {new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileView;
