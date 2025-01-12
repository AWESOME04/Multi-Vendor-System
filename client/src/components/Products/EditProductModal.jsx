import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './Products.css';
import * as api from '@/services/api';

const EditProductModal = ({ product, onClose, onProductUpdated }) => {
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

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        desc: product.desc || '',
        type: product.type || '',
        price: product.price?.toString() || '',
        stock: product.stock?.toString() || '',
        available: product.available ?? true,
        img: null
      });
      setImagePreview(product.img || null);
    }
  }, [product]);

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
      let imageUrl = product.img;
      
      // Upload new image if one is selected
      if (formData.img) {
        try {
          toast.info('Uploading image...');
          const { imageUrl: newImageUrl } = await api.uploadProductImage(formData.img);
          imageUrl = newImageUrl;
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
        available: formData.available,
        img: imageUrl
      };

      toast.info('Updating product...');
      const updatedProduct = await api.updateProduct(product._id, productData);
      toast.success('Product updated successfully!');
      
      if (onProductUpdated) {
        onProductUpdated(updatedProduct);
      }
      onClose();
    } catch (error) {
      console.error('Error updating product:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update product';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className='modal-title'>Edit Product</h2>
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
              {loading ? 'Updating...' : 'Update Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;
