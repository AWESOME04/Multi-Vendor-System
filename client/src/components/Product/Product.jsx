import React from 'react';
import { useGlobalContext } from '@/components/GlobalContext/GlobalContext';
import { toast } from 'react-toastify';
import './Product.css';

const Product = ({ product }) => {
  const store = useGlobalContext();
  
  // Log to debug
  console.log('Cart items:', store.state.cart);
  console.log('Current product:', product);
  
  const isInCart = store.state.cart.some(cartItem => {
    // Log to debug
    console.log('Comparing:', {
      cartItemId: cartItem.productId,
      productId: product.id,
      match: cartItem.productId === product.id
    });
    
    return String(cartItem.productId) === String(product.id);
  });

  const handleAddToCart = async (product) => {
    if (isInCart) {
      toast.info('Item is already in your cart');
      return;
    }
    try {
      await store.addToCart({
        ...product,
        id: product.id // Ensure id is set correctly
      });
    } catch (error) {
      toast.error('Failed to add item to cart');
    }
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