import { useState } from 'react';
import { useGlobalContext } from '@/components/GlobalContext/GlobalContext';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import './CartView.css';
import Order from "../components/Cart/Order";

const CartView = () => {
  const store = useGlobalContext();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    store.updateCartItemQuantity(productId, newQuantity);
  };

  const handleRemoveItem = (productId) => {
    store.removeFromCart(productId);
  };

  const calculateTotal = () => {
    return store.state.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error('Please login to place an order');
      return;
    }

    try {
      setLoading(true);
      const orderData = {
        items: store.state.cart.map(item => ({
          productId: item._id,
          quantity: item.quantity,
          price: item.price
        })),
        total: calculateTotal()
      };

      await axios.post('http://localhost:3000/api/orders', orderData);
      store.clearCart();
      toast.success('Order placed successfully!');
      navigate('/orders');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (store.state.cart.length === 0) {
    return (
      <div className="cart-container">
        <h2>Your Cart is Empty</h2>
        <button onClick={() => navigate('/')} className="continue-shopping">
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div>
      <main>
        <Order
          handleQuantityChange={handleQuantityChange}
          handleRemoveItem={handleRemoveItem}
          calculateTotal={calculateTotal}
          handlePlaceOrder={handlePlaceOrder}
          loading={loading}
          store={store}
        />
      </main>
    </div>
  );
};

export default CartView;
