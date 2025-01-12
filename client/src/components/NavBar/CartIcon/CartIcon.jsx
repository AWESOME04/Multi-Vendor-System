import { Link } from 'react-router-dom';
import { FaShoppingCart } from 'react-icons/fa';
import { useGlobalContext } from '../../GlobalContext/GlobalContext';
import './CartIcon.css';

const CartIcon = () => {
  const { state } = useGlobalContext();
  const cartTotal = state.cartQuantity;

  return (
    <div className="cart-icon">
      <Link to="/cart">
        <FaShoppingCart />
        {cartTotal > 0 && <span className="cart-badge">{cartTotal}</span>}
      </Link>
    </div>
  );
};

export default CartIcon;
