import { useState } from 'react';
import { useGlobalContext } from '@/components/GlobalContext/GlobalContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import './Product.css';
import PlaceholderImg from '../../../../assets/images/placeholder-img.png';

const Product = ({ product, showAddToCart }) => {
  const { user } = useAuth();
  const store = useGlobalContext();
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }
    store.addToCart(product._id);
  };

  return (
    <div className="product-container">
      <div className="image">
        <img
          src={product?.image || PlaceholderImg}
          alt={product?.name}
          width="100%"
        />
      </div>
      <div className="product-details">
        <div className="name-price-product">
          <h4>{product?.name}</h4>
          <h5>${product?.price}</h5>
        </div>
        <h5 className="description">{product?.description}</h5>
        <div className="product-info">
          <p>Stock: {product?.stock_quantity}</p>
        </div>
        {showAddToCart && (
          <button
            className="add-to-cart"
            onClick={handleAddToCart}
            disabled={product?.addedToCart}
          >
            {product?.addedToCart ? 'Added to Cart' : 'Add to Cart'}
          </button>
        )}
      </div>
    </div>
  );
};

export default Product;
