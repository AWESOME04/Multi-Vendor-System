import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import './OrdersView.css';

const OrdersView = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/orders/my-orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="orders-container">
        <h2>Loading orders...</h2>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="orders-container">
        <h2>Please login to view your orders</h2>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="orders-container">
        <p>No orders found</p>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <h2>My Orders</h2>
      <div className="orders-list">
        {orders.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <h3>Order #{order.id}</h3>
              <span className={`status ${order.status}`}>{order.status}</span>
            </div>
            <div className="order-details">
              <p>Total: ${order.total_amount}</p>
              <p>Date: {new Date(order.created_at).toLocaleDateString()}</p>
            </div>
            {order.items && order.items.map(item => (
              <div key={item.id} className="order-item">
                <img 
                  src={item.product.image_url || '/placeholder-image.svg'} 
                  alt={item.product.title}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/placeholder-image.svg';
                  }}
                />
                <div className="item-details">
                  <h4>{item.product.title}</h4>
                  <p>Quantity: {item.quantity}</p>
                  <p>Price: ${item.price_at_time}</p>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersView;
