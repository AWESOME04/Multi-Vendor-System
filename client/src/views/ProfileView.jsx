import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import './ProfileView.css';

const ProfileView = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const [ordersRes, productsRes] = await Promise.all([
        axios.get(`http://localhost:3000/api/orders/user/${user.id}`),
        user.role === 'seller' 
          ? axios.get(`http://localhost:3000/api/products/seller/${user.id}`)
          : Promise.resolve({ data: [] })
      ]);

      setOrders(ordersRes.data);
      setProducts(productsRes.data);
    } catch (error) {
      // toast.error('Failed to fetch user data');
      console.error('Error fetching user data:', error);
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
        <div className="orders-section">
          <h3>My Orders</h3>
          {orders.length === 0 ? (
            <p>No orders found</p>
          ) : (
            <div className="orders-list">
              {orders.map(order => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <h4>Order #{order.id}</h4>
                    <span className={`status status-${order.status}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="order-items">
                    {order.items.map(item => (
                      <div key={item.id} className="order-item">
                        <img 
                          src={item.product.image || '/placeholder-image.svg'} 
                          alt={item.product.name} 
                        />
                        <div className="item-details">
                          <p>{item.product.name}</p>
                          <p>Quantity: {item.quantity}</p>
                          <p>Price: ${item.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="order-footer">
                    <p>Total: ${order.total}</p>
                    <p>Ordered on: {new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {user.role === 'seller' && (
          <div className="products-section">
            <h3>My Products</h3>
            {products.length === 0 ? (
              <p>No products listed</p>
            ) : (
              <div className="products-list">
                {products.map(product => (
                  <div key={product.id} className="product-card">
                    <img 
                      src={product.image || '/placeholder-image.svg'} 
                      alt={product.name} 
                    />
                    <div className="product-details">
                      <h4>{product.name}</h4>
                      <p>{product.description}</p>
                      <p>Price: ${product.price}</p>
                      <p>Stock: {product.stock_quantity}</p>
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
