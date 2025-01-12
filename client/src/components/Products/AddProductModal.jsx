import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Products.css';
import { uploadImage } from '../../config/cloudinary';

const AddProductModal = ({ onClose, onProductAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    desc: '',
    type: '',
    price: '',
    stock: '',
    available: true,
    img: null
  });

  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'img') {
      const file = files[0];
      setFormData(prev => ({
        ...prev,
        img: file
      }));
      
      // Create preview URL
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setImagePreview(null);
      }
    } else if (name === 'price' || name === 'stock') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
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
      let imageUrl = null;
      
      // Upload image if one is selected
      if (formData.img) {
        try {
          toast.info('Uploading image...');
          imageUrl = await uploadImage(formData.img, 'products');
          console.log('Image uploaded:', imageUrl);
          toast.success('Image uploaded successfully');
        } catch (error) {
          console.error('Error uploading image:', error);
          toast.error('Failed to upload image. Please try again.');
          setLoading(false);
          return;
        }
      }

      // Create the product data
      const productData = {
        name: formData.name,
        desc: formData.desc,
        type: formData.type,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        available: true,
        img: imageUrl
      };

      toast.info('Creating product...');
      const token = localStorage.getItem('token');
      const response = await axios.post('https://product-service-qwti.onrender.com/product/create', productData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      toast.success('Product added successfully!');
      if (onProductAdded) {
        onProductAdded(response.data);
      }
      onClose();
    } catch (error) {
      console.error('Error adding product:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add product';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className='modal-title'>Add New Product</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <p>Product Name</p>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter product name"
            />
          </div>
          <div className="form-group">
            <p>Description</p>
            <textarea
              name="desc"
              value={formData.desc}
              onChange={handleChange}
              required
              placeholder="Enter product description"
            />
          </div>
          <div className="form-group">
            <p>Product Type</p>
            <input
              type="text"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              placeholder="Enter product type"
            />
          </div>
          <div className="form-group">
            <p>Price</p>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              placeholder="Enter price"
              min="0"
              step="0.01"
            />
          </div>
          <div className="form-group">
            <p>Stock</p>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              required
              placeholder="Enter stock quantity"
              min="0"
            />
          </div>
          <div className="form-group">
            <p>Product Image</p>
            <input
              type="file"
              name="img"
              onChange={handleChange}
              accept="image/*"
            />
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" style={{ maxWidth: '200px', marginTop: '10px' }} />
              </div>
            )}
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
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
