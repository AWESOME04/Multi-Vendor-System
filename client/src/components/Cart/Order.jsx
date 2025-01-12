import OrderDetails from "./OrderDetails/OrderDetails";
import OrderSummary from "./OrderSummary/OrderSummary";
import EmptyState from "./EmptyState/EmptyState";
import { useGlobalContext } from "@/components/GlobalContext/GlobalContext";

import "./Order.css";

const Order = () => {
  let store = useGlobalContext();
  return (
    <div className="main-order-container">
      <div className="view-order">
        <div className="order-title">
          <h2>Order</h2>
          <h2>{store.state.cart.length} Items</h2>
        </div>
        <div className="order-container">
          {store.state.cart.length > 0 ? (
            store.state.cart.map((product) => (
              <OrderDetails
                key={product.productId}
                product={product}
              />
            ))
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
      <div className="order-summary">
        <h2>Order Summary</h2>
        <OrderSummary />
      </div>
    </div>
  );
};
export default Order;
