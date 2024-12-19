import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import './AddProductModal.css';

const AddProductModal = ({ onClose, onProductAdded }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    stockQuantity: '',
    category: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || user.role !== 'seller') {
      toast.error('Only sellers can add products');
      return;
    }

    // Validate numeric fields
    const numericPrice = parseFloat(formData.price);
    const numericStock = parseInt(formData.stockQuantity);

    if (isNaN(numericPrice) || numericPrice <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    if (isNaN(numericStock) || numericStock < 0) {
      toast.error('Please enter a valid stock quantity');
      return;
    }

    try {
      setLoading(true);
      const formPayload = new FormData();
      Object.keys(formData).forEach(key => {
        formPayload.append(key, formData[key]);
      });

      if (selectedFile) {
        formPayload.append('image', selectedFile);
      }

      const response = await axios.post('http://localhost:3000/api/products', formPayload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Product added successfully!');
      onProductAdded(response.data);
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add product');
      console.error('Error adding product:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Add New Product</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Product Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Price ($)</label>
            <input
              type="number"
              name="price"
              min="0.01"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Product Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="file-input"
            />
          </div>
          <div className="form-group">
            <label>Stock Quantity</label>
            <input
              type="number"
              name="stockQuantity"
              min="0"
              value={formData.stockQuantity}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select Category</option>
              <option value="electronics">Electronics</option>
              <option value="clothing">Clothing</option>
              <option value="books">Books</option>
              <option value="home">Home & Garden</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Adding...' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
