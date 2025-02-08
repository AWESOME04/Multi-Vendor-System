import React from 'react';
import { useGlobalContext } from '@/components/GlobalContext/GlobalContext';
import { toast } from 'react-toastify';
import './Product.css';

const Product = ({ product }) => {
  const store = useGlobalContext();
  
  const isInCart = store.state.cart.some(
    item => item.productId === product.id || item.productId === product._id
  );

  const handleAddToCart = async (product) => {
    if (isInCart) {
      toast.info('Item is already in your cart');
      return;
    }
    await store.addToCart(product);
  };

  return (
    <div className="product-card">
      <img 
        src={product.img || product.image} 
        alt={product.name} 
        onError={(e) => e.target.src = "https://placehold.co/600x400"}
      />
      <div className="product-info">
        <h3>{product.name}</h3>
        <p>{product.desc}</p>
        <p className="price">${product.price}</p>
        <button 
          onClick={() => handleAddToCart(product)}
          className={isInCart ? 'in-cart' : ''}
          disabled={isInCart}
        >
          {isInCart ? 'Item in Cart' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default Product; 