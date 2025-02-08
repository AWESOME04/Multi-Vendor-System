import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import './Auth.css';
import Spinner from '../common/Spinner';

const LoginModal = ({ onClose, switchToRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const userData = await login(formData.email, formData.password);
      if (userData) {
        toast.success('Login successful!');
        onClose();
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(
        error.message || 
        error.response?.data?.message || 
        'Login failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
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
          <button 
            type="submit" 
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Spinner />
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>
        <p>
          Don't have an account?{' '}
          <button 
            className="switch-auth" 
            onClick={switchToRegister}
            disabled={isLoading}
          >
            Register
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

export default LoginModal;
