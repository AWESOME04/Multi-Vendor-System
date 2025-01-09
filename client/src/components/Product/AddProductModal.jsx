import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import * as api from '@/services/api';
import { uploadImage } from '@/config/firebase';
import './Product.css';

const AddProductModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    desc: '',
    type: '',
    stock: '',
    price: '',
    img: null,
    available: true
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleChange = (e) => {
    const { name, value, files, type: inputType } = e.target;
    if (name === 'img') {
      setFormData(prev => ({
        ...prev,
        img: files[0]
      }));
    } else if (inputType === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First upload the image to Firebase
      let imageUrl = '';
      if (formData.img) {
        imageUrl = await uploadImage(formData.img, 'products');
      }

      // Then create the product
      const productData = {
        name: formData.name,
        desc: formData.desc,
        type: formData.type,
        stock: parseInt(formData.stock),
        price: parseFloat(formData.price),
        img: imageUrl,
        available: true,
        seller: user.id
      };

      await api.createProduct(productData);
      toast.success('Product added successfully!');
      onClose();
    } catch (error) {
      console.error('Error adding product:', error);
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
            <input
              type="text"
              name="name"
              placeholder="Product Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <textarea
              name="desc"
              placeholder="Product Description"
              value={formData.desc}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              name="type"
              placeholder="Product Type"
              value={formData.type}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="number"
              name="price"
              placeholder="Price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
            />
          </div>
          <div className="form-group">
            <input
              type="number"
              name="stock"
              placeholder="Stock Quantity"
              value={formData.stock}
              onChange={handleChange}
              required
              min="0"
            />
          </div>
          <div className="form-group">
            <input
              type="file"
              name="img"
              accept="image/*"
              onChange={handleChange}
              required
            />
          </div>
          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Adding Product...' : 'Add Product'}
          </button>
        </form>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
    </div>
  );
};

export default AddProductModal;
