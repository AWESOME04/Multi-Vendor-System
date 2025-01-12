import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import './Auth.css';

const LoginModal = ({ onClose, switchToRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userData = await login(formData.email, formData.password);
      if (userData) {
        toast.success('Login successful!');
        onClose(); // Close the modal
        // Use navigate instead of window.location for smoother navigation
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(
        error.message || 
        error.response?.data?.message || 
        'Login failed. Please try again.'
      );
    }
  };

  return (
    <div className="auth-modal">
      <div className="auth-content">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
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
            />
          </div>
          <button type="submit" className="auth-button">Login</button>
        </form>
        <p>
          Don't have an account?{' '}
          <button className="switch-auth" onClick={switchToRegister}>
            Register
          </button>
        </p>
        <button className="close-button" onClick={onClose}>
          ×
        </button>
      </div>
    </div>
  );
};

export default LoginModal;
