import { useState } from 'react';
import { useGlobalContext } from '@/components/GlobalContext/GlobalContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import { FaStar } from 'react-icons/fa';
import './Product.css';

const Product = ({ product }) => {
  const { user } = useAuth();
  const store = useGlobalContext();
  const [quantity, setQuantity] = useState(1);

  const stars = Array.from({ length: product?.rating || 0 }, (_, i) => (
    <FaStar key={i} />
  ));

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
          src={product?.product_image || 'https://via.placeholder.com/300'}
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
        <div className="star-rating">
          <div className="star">{stars}</div>
          <span>({Math.floor(Math.random() * 100)} Reviews)</span>
        </div>
        <button
          className="add-to-cart"
          onClick={handleAddToCart}
          disabled={product?.addedToCart}
        >
          {product?.addedToCart ? 'Added to Cart' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default Product;
