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
    
    try {
      setLoading(true);

      // Validate required fields
      if (!formData.title || !formData.description || !formData.price || !formData.stockQuantity || !formData.category) {
        toast.error('Please fill in all required fields');
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

      // Create FormData object
      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('description', formData.description.trim());
      data.append('price', numericPrice.toString());
      data.append('stockQuantity', numericStock.toString());
      data.append('category', formData.category.trim());

      if (selectedFile) {
        data.append('image', selectedFile);
      }

      // Log the data being sent (for debugging)
      console.log('Sending data:', {
        title: formData.title,
        description: formData.description,
        price: numericPrice,
        stockQuantity: numericStock,
        category: formData.category
      });

      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:3000/api/products', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      toast.success('Product added successfully!');
      if (onProductAdded) {
        onProductAdded(response.data);
      }
      onClose();
    } catch (error) {
      console.error('Error adding product:', error.response?.data || error);
      toast.error(error.response?.data?.message || 'Failed to add product');
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
            <label>Title*</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter product title"
            />
          </div>

          <div className="form-group">
            <label>Description*</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Enter product description"
            />
          </div>

          <div className="form-group">
            <label>Price*</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0.01"
              step="0.01"
              required
              placeholder="Enter price"
            />
          </div>

          <div className="form-group">
            <label>Stock Quantity*</label>
            <input
              type="number"
              name="stockQuantity"
              value={formData.stockQuantity}
              onChange={handleChange}
              min="0"
              required
              placeholder="Enter stock quantity"
            />
          </div>

          <div className="form-group">
            <label>Category*</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select a category</option>
              <option value="electronics">Electronics</option>
              <option value="clothing">Clothing</option>
              <option value="books">Books</option>
              <option value="home">Home & Garden</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Product Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          <div className="modal-actions">
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Adding...' : 'Add Product'}
            </button>
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
