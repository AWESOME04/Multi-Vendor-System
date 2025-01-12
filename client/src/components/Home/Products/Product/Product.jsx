import { useGlobalContext } from '@/components/GlobalContext/GlobalContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import './Product.css';

const Product = ({ product }) => {
  const { addToCart } = useGlobalContext();
  const { user } = useAuth();
  const isBuyer = user?.role?.toUpperCase() === 'BUYER';

  const handleAddToCart = () => {
    const cartItem = {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.img || product.image || "https://placehold.co/600x400"
    };
    addToCart(cartItem);
  };

  const handleImageError = (e) => {
    e.target.src = "https://placehold.co/600x400";
  };

  return (
    <div className="product-card">
      <div className="product-image">
        <img 
          src={product.img || product.image || "https://placehold.co/600x400"} 
          alt={product.name}
          onError={handleImageError}
        />
      </div>
      <div className="product-info">
        <h3>{product.name}</h3>
        <p>{product.desc || product.description}</p>
        <div className="product-details">
          <span className="price">${product.price}</span>
          <span className="stock">Stock: {product.stock || product.stock_quantity}</span>
        </div>
        {isBuyer && (
          <button 
            onClick={handleAddToCart} 
            className="add-to-cart"
            disabled={!product.available || (product.stock || product.stock_quantity) <= 0}
          >
            {!product.available ? 'Not Available' : 
             (product.stock || product.stock_quantity) <= 0 ? 'Out of Stock' : 
             'Add to Cart'}
          </button>
        )}
      </div>
    </div>
  );
};

export default Product;
