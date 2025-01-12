import "./OrderDetails.css";

import { useGlobalContext } from "@/components/GlobalContext/GlobalContext";

const OrderDetails = ({ product }) => {
  const store = useGlobalContext();
  
  const handleImageError = (e) => {
    e.target.src = "https://placehold.co/600x400";
  };

  return (
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
            onClick={() => {
              store.reduceQuantity(product.productId);
            }}
          >
            -
          </button>
          <p>{product.quantity}</p>
          <button
            onClick={() => {
              store.addQuantity(product.productId);
            }}
          >
            +
          </button>
        </div>
      </div>
      <div className="remove">
        <button
          onClick={() => {
            store.removeFromCart(product.productId);
          }}
        >
          Remove
        </button>
      </div>
    </div>
  );
};
export default OrderDetails;
