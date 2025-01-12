import { useState } from 'react';
import { uploadImage } from '../../config/cloudinary';
import { toast } from 'react-toastify';
import { createProduct } from '../../services/api';
import './AddProduct.css';

const AddProduct = () => {
  const [formData, setFormData] = useState({
    name: '',
    desc: '',
    type: 'Electronics',
    price: '',
    stock: '',
    img: '',
    available: true
  });
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (event) => {
    try {
      const file = event.target.files[0];
      if (!file) return;

      // Show preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);

      setUploading(true);
      const imageUrl = await uploadImage(file);
      console.log('Uploaded image URL:', imageUrl); // Debug log
      setFormData(prev => ({ ...prev, img: imageUrl }));
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.img) {
        toast.error('Please upload an image first');
        return;
      }

      console.log('Submitting product data:', formData); // Debug log
      const response = await createProduct(formData);
      toast.success('Product created successfully!');
      // Reset form
      setFormData({
        name: '',
        desc: '',
        type: 'Electronics',
        price: '',
        stock: '',
        img: '',
        available: true
      });
      setPreviewUrl('');
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Failed to create product');
    }
  };

  return (
    <div className="add-product-container">
      <h2>Add New Product</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Product Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploading}
          />
          {previewUrl && (
            <img 
              src={previewUrl} 
              alt="Preview" 
              style={{ width: '200px', marginTop: '10px' }}
            />
          )}
        </div>

        <div className="form-group">
          <label>Name</label>
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
          <label>Type</label>
          <select name="type" value={formData.type} onChange={handleChange}>
            <option value="Electronics">Electronics</option>
            <option value="Fashion">Fashion</option>
            <option value="Home and Kitchen">Home and Kitchen</option>
            {/* Add other options as needed */}
          </select>
        </div>

        <div className="form-group">
          <label>Price</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
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

        <button type="submit" disabled={uploading}>
          {uploading ? 'Uploading...' : 'Add Product'}
        </button>
      </form>
    </div>
  );
};

export default AddProduct; 