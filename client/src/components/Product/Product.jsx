import React from 'react';
import { useGlobalContext } from '../GlobalContext/GlobalContext';
import { toast } from 'react-toastify';
import './Product.css';

const Product = ({ product }) => {
  const store = useGlobalContext();
  
  // Log to debug
  console.log('Cart items:', store.state.cart);
  console.log('Current product:', product);
  
  const isInCart = store.state.cart.some(item => String(item.productId) === String(product.id));

  const handleAddToCart = async (product) => {
    if (isInCart) {
      toast.info('Item is already in your cart');
      return;
    }
    try {
      await store.addToCart({
        ...product,
        id: product.id
      });
    } catch (error) {
      toast.error('Failed to add item to cart');
    }
  };

  return (
    <div className="product-card">
      <img 
        src={product.img || '/placeholder.png'} 
        alt={product.name}
        className="product-image"
      />
      <div className="product-details">
        <h3 className="product-title">{product.name}</h3>
        <p className="product-description">{product.desc}</p>
        <span className="product-price">${product.price}</span>
        <button
          className="add-to-cart-btn"
          onClick={() => handleAddToCart(product)}
          disabled={isInCart}
        >
          {isInCart ? 'In Cart' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default Product; 