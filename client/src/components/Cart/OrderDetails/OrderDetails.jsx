import { useState } from 'react';
import "./OrderDetails.css";
import { useGlobalContext } from "@/components/GlobalContext/GlobalContext";
import { toast } from 'react-toastify';
import ConfirmModal from '../../common/ConfirmModal';

const OrderDetails = ({ product, handleRemoveItem, handleQuantityChange }) => {
  const store = useGlobalContext();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  const handleImageError = (e) => {
    e.target.src = "https://placehold.co/600x400";
  };

  const handleRemove = () => {
    setShowConfirmModal(true);
  };

  const confirmRemove = () => {
    try {
      handleRemoveItem(product.productId);
      setShowConfirmModal(false);
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const updateQuantity = (increment) => {
    const newQuantity = increment ? 
      product.quantity + 1 : 
      Math.max(1, product.quantity - 1);
    
    handleQuantityChange(product.productId, newQuantity);
  };

  return (
    <>
      <div className="order-details">
        <div className="order-detail">
          <div className="left-side">
            <img 
              src={product.image || "https://placehold.co/600x400"} 
              alt={product.name}
              onError={handleImageError}
            />
          </div>
          <div className="right-side">
            <h3>{product.name}</h3>
            <p>{product.description}</p>
          </div>
        </div>
        <div className="order-price">
          <h3>${product.price}</h3>
        </div>
        <div className="quantity">
          <p>Quantity</p>
          <div className="increase-quantity">
            <button 
              onClick={() => updateQuantity(false)}
              disabled={product.quantity <= 1}
              className={product.quantity <= 1 ? 'disabled' : ''}
            >
              -
            </button>
            <p>{product.quantity}</p>
            <button onClick={() => updateQuantity(true)}>+</button>
          </div>
        </div>
        <div className="remove">
          <button onClick={handleRemove}>
            Remove
          </button>
        </div>
      </div>

      <ConfirmModal 
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmRemove}
        title="Remove Item"
        message={`Are you sure you want to remove ${product.name} from your cart?`}
      />
    </>
  );
};

export default OrderDetails;
