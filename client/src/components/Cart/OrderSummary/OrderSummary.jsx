import "./OrderSummary.css";
import { useGlobalContext } from "../../GlobalContext/GlobalContext";
import { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";

const OrderSummary = () => {
  const store = useGlobalContext();
  const [deliveryType, setDeliveryType] = useState("Standard");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const getSubtotal = () => {
    return store.state.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getDeliveryCost = () => {
    return deliveryType === "Standard" ? 5 : 10;
  };

  const getTotal = () => {
    return getSubtotal() + getDeliveryCost();
  };

  const handleCheckout = async () => {
    try {
      if (!phone) {
        toast.error('Please enter your phone number');
        return;
      }

      setIsLoading(true);

      // Get user details
      const user = JSON.parse(localStorage.getItem('user'));
      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; text-align: center;">Order Placed Successfully!</h1>
          <p>Dear ${user.name || 'Valued Customer'},</p>
          <p>Thank you for your order. Your order has been received and is being processed.</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; margin: 20px 0;">
            <h2 style="color: #333;">Order Summary</h2>
            <p><strong>Total Amount:</strong> $${getTotal()}</p>
            <p><strong>Delivery Type:</strong> ${deliveryType}</p>
            <p><strong>Number of Items:</strong> ${store.state.cart.length}</p>
          </div>

          <p style="text-align: center; color: #666;">
            Thank you for shopping with us!
          </p>
        </div>
      `;

      // Send email through backend
      await axios.post('http://localhost:8003/send-order-email', {
        email: user.email,
        orderDetails: emailContent
      });

      // Clear cart and show success message
      store.clearCart();
      toast.success('Order confirmation sent to ' + user.email);
    } catch (error) {
      console.error('Error during checkout:', error);
      toast.error('Failed to place order');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="is-order-summary">
      <div className="sub-container">
        <div className="contains-order">
          <div className="total-cost">
            <h4>Subtotal ({store.state.cartQuantity} items)</h4>
            <h4>${getSubtotal().toFixed(2)}</h4>
          </div>

          <div className="shipping">
            <h4>Shipping</h4>
            <select
              className="select-dropdown"
              value={deliveryType}
              onChange={(e) => setDeliveryType(e.target.value)}
            >
              <option value="Standard">Standard ($5)</option>
              <option value="Express">Express ($10)</option>
            </select>
          </div>

          <div className="phone-number">
            <h4>Phone Number</h4>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              className="phone-input"
            />
          </div>

          <div className="total">
            <h4>Total</h4>
            <h4>${getTotal().toFixed(2)}</h4>
          </div>

          <button
            className="checkout-button"
            onClick={handleCheckout}
            disabled={store.state.cart.length === 0 || isLoading}
          >
            {isLoading ? 'Processing...' : 'Proceed to Checkout'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
