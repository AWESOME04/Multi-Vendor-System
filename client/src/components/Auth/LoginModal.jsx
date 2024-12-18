import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import './Auth.css';

const LoginModal = ({ onClose, switchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      toast.success('Login successful!');
      onClose();
    } else {
      toast.error(result.error);
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
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
        <button className="close-button" onClick={onClose}>×</button>
      </div>
    </div>
  );
};

export default LoginModal;
