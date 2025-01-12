import { useState } from 'react';
import { useGlobalContext } from '@/components/GlobalContext/GlobalContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import EditProductModal from '../Products/EditProductModal';
import * as api from '@/services/api';
import './ProductCard.css';

const ProductCard = ({ product, onProductUpdated, onProductDeleted, forceShowActions }) => {
  const { user, isSeller } = useAuth();
  const store = useGlobalContext();
  const [quantity, setQuantity] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);

  console.log('ProductCard render:', { 
    userRole: user?.role,
    isSeller,
    productId: product._id 
  });

  const handleAddToCart = () => {
    store.addToCart({ ...product, quantity });
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setLoading(true);
      try {
        await api.deleteProduct(product._id);
        toast.success('Product deleted successfully');
        if (onProductDeleted) {
          onProductDeleted(product._id);
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Failed to delete product');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleProductUpdated = (updatedProduct) => {
    if (onProductUpdated) {
      onProductUpdated(updatedProduct);
    }
    setShowEditModal(false);
  };

  // Show seller actions if we're on the seller products page or if the user is a seller
  const showSellerActions = forceShowActions || isSeller;

  return (
    <>
      <div className="product-card">
        <img src={product.img || 'https://via.placeholder.com/300'} alt={product.name} className="product-image" />
        <div className="product-info">
          <h3>{product.name}</h3>
          <p className="price">${product.price}</p>
          <p className="description">{product.desc}</p>
          <p className="stock">Stock: {product.stock}</p>
          {showSellerActions ? (
            <div className="seller-actions">
              <button 
                className="edit-btn" 
                onClick={handleEdit}
                disabled={loading}
              >
                Edit
              </button>
              <button 
                className="delete-btn" 
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          ) : (
            <div className="product-actions">
              <div className="quantity-selector">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
              <button className="add-to-cart" onClick={handleAddToCart}>
                Add to Cart
              </button>
            </div>
          )}
        </div>
      </div>
      {showEditModal && (
        <EditProductModal
          product={product}
          onClose={() => setShowEditModal(false)}
          onProductUpdated={handleProductUpdated}
        />
      )}
    </>
  );
};

export default ProductCard;
