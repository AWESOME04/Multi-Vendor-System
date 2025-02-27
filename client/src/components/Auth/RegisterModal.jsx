import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import './Auth.css';
import Spinner from '../common/Spinner';

const RegisterModal = ({ onClose, switchToLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    phone: '',
    role: 'BUYER' // Default role
  });

  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validate form data
    if (!formData.email || !formData.password || !formData.phone) {
      setError('All fields are required');
      setIsLoading(false);
      return;
    }

    try {
      const result = await register({
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: formData.role || 'BUYER'  // Ensure role is set
      });
      
      if (result.success) {
        toast.success('Registration successful! You are now logged in.');
        onClose();
      }
    } catch (error) {
      // Show a more user-friendly error message
      const errorMessage = error.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      
      // Only show toast for non-validation errors
      if (!errorMessage.includes('required')) {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-modal">
      <div className="auth-content">
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="role-select"
              disabled={isLoading}
            >
              <option value="BUYER">Buyer</option>
              <option value="SELLER">Seller</option>
            </select>
          </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button 
            type="submit" 
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Spinner />
                Registering...
              </>
            ) : (
              'Register'
            )}
          </button>
        </form>
        <p>
          Already have an account?{' '}
          <button 
            className="switch-auth" 
            onClick={switchToLogin}
            disabled={isLoading}
          >
            Login
          </button>
        </p>
        <button 
          className="close-button" 
          onClick={onClose}
          disabled={isLoading}
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default RegisterModal;
