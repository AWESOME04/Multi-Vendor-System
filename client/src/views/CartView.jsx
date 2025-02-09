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

  const handlePlaceOrder = async (paymentReference) => {
    if (!user) {
      toast.error('Please login to place an order');
      return;
    }

    try {
      setLoading(true);
      const orderData = {
        customerId: user._id,
        items: store.state.cart.map(item => ({
          productId: item.productId || item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image
        })),
        total: calculateTotal(),
        paymentReference: paymentReference
      };

      console.log('Sending order data:', orderData);

      const response = await axios.post('https://order-service-uag9.onrender.com/orders', orderData, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });

      console.log('Order response:', response.data);
      
      if (response.data) {
        await store.clearCart();
        toast.success('Order placed successfully!');
        navigate('/orders');
      }
    } catch (error) {
      console.error('Order error:', error);
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
