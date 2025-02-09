import { useState, useEffect } from 'react';
import { productApi } from '@/config/api';
import { toast } from 'react-toastify';
import './EditProductModal.css';

const EditProductModal = ({ isOpen, onClose, onSubmit, product }) => {
  const [formData, setFormData] = useState({
    name: '',
    desc: '',
    price: '',
    stock: '',
    available: true,
    img: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && product?.id) {
      fetchProductDetails();
    }
  }, [isOpen, product]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await productApi.get(`/product/${product.id}`);
      const productData = response.data.data || response.data;
      
      setFormData({
        name: productData.name || '',
        desc: productData.desc || '',
        price: productData.price || '',
        stock: productData.stock || '',
        available: productData.available ?? true,
        img: productData.img || ''
      });
    } catch (error) {
      console.error('Error fetching product details:', error);
      toast.error('Failed to load product details');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="edit-modal-overlay">
      <div className="edit-modal">
        <div className="edit-modal-header">
          <h3>Edit Product</h3>
        </div>
        
        {loading ? (
          <div className="loading-spinner">Loading product details...</div>
        ) : (
          <>
            <div className="edit-modal-content">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Product Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="desc"
                    value={formData.desc}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Price</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    step="0.01"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Stock</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Image URL</label>
                  <input
                    type="text"
                    name="img"
                    value={formData.img}
                    onChange={handleChange}
                    placeholder="Image URL"
                  />
                  {formData.img && (
                    <img 
                      src={formData.img} 
                      alt="Product preview" 
                      className="image-preview"
                      onError={(e) => e.target.src = '/placeholder.png'}
                    />
                  )}
                </div>

                <div className="form-group checkbox">
                  <label>
                    <input
                      type="checkbox"
                      name="available"
                      checked={formData.available}
                      onChange={handleChange}
                    />
                    Available for Sale
                  </label>
                </div>
              </form>
            </div>
            
            <div className="edit-modal-footer">
              <button 
                type="button" 
                className="cancel-button" 
                onClick={onClose}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="save-button"
                disabled={loading}
                onClick={handleSubmit}
              >
                Save Changes
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EditProductModal; 