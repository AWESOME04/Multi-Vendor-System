import "./OrderSummary.css";
import { useGlobalContext } from "../../GlobalContext/GlobalContext";
import { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useAuth } from '@/context/AuthContext';

const OrderSummary = () => {
  const store = useGlobalContext();
  const { user } = useAuth();
  const [deliveryType, setDeliveryType] = useState("Standard");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const getSubtotal = () => {
    return store.state.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getDeliveryCost = () => {
    return deliveryType === "Standard" ? 5 : 10;
  };

  const getTotal = () => {
    return getSubtotal() + getDeliveryCost();
  };

  const handlePaystackPayment = () => {
    if (!phone) {
      toast.error('Please enter your phone number');
      return;
    }

    if (!window.PaystackPop) {
      toast.error('Payment system is not available. Please try again later.');
      return;
    }

    setIsProcessing(true);

    try {
      const paymentConfig = {
        key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
        email: user?.email,
        amount: Math.round(getTotal() * 100),
        currency: 'GHS',
        ref: `ref_${Math.floor(Math.random() * 1000000000 + 1)}`,
        phone: phone,
        
        callback: function(response) {
          console.log('Payment successful:', response);
          
          const processOrder = async () => {
            try {
              // Send email
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
                    <p><strong>Payment Reference:</strong> ${response.reference}</p>
                  </div>

                  <p style="text-align: center; color: #666;">
                    Thank you for shopping with us!
                  </p>
                </div>
              `;

              await axios.post('https://order-service-uag9.onrender.com/send-order-email', {
                email: user.email,
                orderDetails: emailContent
              });

              await store.clearCart();
              toast.success('Payment successful! Order confirmation sent to ' + user.email);
            } catch (error) {
              console.error('Error processing order:', error);
              toast.error('Payment successful but order processing failed');
            } finally {
              setIsProcessing(false);
            }
          };

          processOrder();
        },
        
        onClose: function() {
          setIsProcessing(false);
          toast.info('Payment cancelled');
        }
      };

      const handler = window.PaystackPop.setup(paymentConfig);
      handler.openIframe();
    } catch (error) {
      console.error('Payment setup error:', error);
      toast.error('Failed to initialize payment. Please try again.');
      setIsProcessing(false);
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
            className={`checkout-button ${isProcessing ? 'processing' : ''}`}
            onClick={handlePaystackPayment}
            disabled={store.state.cart.length === 0 || isLoading || isProcessing || getTotal() <= 0}
          >
            {isProcessing ? 'Processing Payment...' : 'Proceed to Checkout'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
