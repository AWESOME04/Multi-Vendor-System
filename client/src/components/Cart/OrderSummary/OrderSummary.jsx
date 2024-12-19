import "./OrderSummary.css";
import { useGlobalContext } from "@/components/GlobalContext/GlobalContext";
import { useState } from "react";
import { toast } from "react-toastify";

const OrderSummary = () => {
  const store = useGlobalContext();
  const [deliveryType, setDeliveryType] = useState("Standard");
  const [phone, setPhone] = useState("");

  const getSubtotal = () => {
    return store.state.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getDeliveryCost = () => {
    return deliveryType === "Standard" ? 5 : 10;
  };

  const getTotal = () => {
    return getSubtotal() + getDeliveryCost();
  };

  const handleCheckout = () => {
    if (!phone) {
      toast.error('Please enter your phone number');
      return;
    }

    const payload = {
      deliveryType,
      deliveryCost: getDeliveryCost(),
      subtotal: getSubtotal(),
      total: getTotal(),
      phoneNumber: phone,
      items: store.state.cart
    };

    // Here you would typically make an API call to process the order
    console.log('Processing order:', payload);
    toast.success('Order placed successfully!');
    store.clearCart();
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
            disabled={store.state.cart.length === 0}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};
export default OrderSummary;
