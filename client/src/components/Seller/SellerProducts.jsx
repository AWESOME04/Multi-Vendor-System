import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { productApi } from '@/config/api';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash } from 'react-icons/fa';
import ConfirmModal from '../common/ConfirmModal';
import './SellerProducts.css';

const SellerProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchSellerProducts();
    }
  }, [user]);

  const fetchSellerProducts = async () => {
    try {
      const response = await productApi.get('/');
      const allProducts = response?.data?.products || response?.data?.data?.products || [];
      // Filter products for the current seller
      const sellerProducts = allProducts.filter(product => product.seller === user.id);
      setProducts(sellerProducts);
    } catch (error) {
      console.error('Error fetching seller products:', error);
      toast.error('Failed to load your products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    // You can implement a modal or navigate to edit page
    toast.info('Edit functionality coming soon');
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;

    try {
      await productApi.delete(`/product/${selectedProduct.id}`);
      toast.success('Product deleted successfully');
      setProducts(products.filter(p => p.id !== selectedProduct.id));
      setShowDeleteModal(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const confirmDelete = (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  if (loading) {
    return <div className="seller-loading">Loading your products...</div>;
  }

  return (
    <div className="seller-products">
      <h2>My Products</h2>
      {products.length === 0 ? (
        <div className="seller-no-products">
          <p>You haven't posted any products yet</p>
          <button className="seller-add-product-btn">Add Your First Product</button>
        </div>
      ) : (
        <div className="seller-products-grid">
          {products.map((product) => (
            <div key={product.id} className="seller-product-card">
              <img 
                src={product.img || '/placeholder.png'} 
                alt={product.name} 
                className="seller-product-image"
              />
              <div className="seller-product-details">
                <h3>{product.name}</h3>
                <p>{product.desc}</p>
                <div className="seller-product-info">
                  <span className="seller-price">${product.price}</span>
                  <span className="seller-stock">Stock: {product.stock}</span>
                </div>
                <div className="seller-product-status">
                  <span className={`seller-status ${product.available ? 'active' : 'inactive'}`}>
                    {product.available ? 'Available' : 'Out of Stock'}
                  </span>
                </div>
                <div className="seller-product-actions">
                  <button 
                    className="seller-edit-btn"
                    onClick={() => handleEdit(product)}
                  >
                    <FaEdit /> Edit
                  </button>
                  <button 
                    className="seller-delete-btn"
                    onClick={() => confirmDelete(product)}
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedProduct(null);
        }}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete ${selectedProduct?.name}? This action cannot be undone.`}
      />
    </div>
  );
};

export default SellerProducts;
