import { useState } from 'react';
import { FaUser } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import LoginModal from '@/components/Auth/LoginModal';
import RegisterModal from '@/components/Auth/RegisterModal';
import AddProductModal from '@/components/Products/AddProductModal';
import { useAuth } from '@/context/AuthContext';
import './Account.css';

const Account = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const handleProductAdded = () => {
    setShowAddProduct(false);
    // Refresh products if needed
  };

  return (
    <div className="account">
      {user ? (
        <div className="user-menu">
          <button onClick={() => setShowUserMenu(!showUserMenu)} className="user-button">
            <FaUser /> {user.email}
          </button>
          {showUserMenu && (
            <div className="user-menu-content">
              <Link to="/profile" className="user-menu-item">View Profile</Link>
              {user.role?.toUpperCase() === 'SELLER' ? (
                <>
                  <Link to="/seller/products" className="user-menu-item">My Products</Link>
                  <button 
                    onClick={() => {
                      setShowAddProduct(true);
                      setShowUserMenu(false);
                    }} 
                    className="user-menu-item"
                  >
                    Add Product
                  </button>
                </>
              ) : (
                <>
                  {/* <Link to="/orders" className="user-menu-item">My Orders</Link> */}
                  <Link to="/cart" className="user-menu-item">Cart</Link>
                </>
              )}
              <button onClick={handleLogout} className="user-menu-item">Logout</button>
            </div>
          )}
        </div>
      ) : (
        <div className="auth-buttons">
          <button onClick={() => setShowLogin(true)} className="login-btn">
            Login
          </button>
          <button onClick={() => setShowRegister(true)} className="register-btn">
            Register
          </button>
        </div>
      )}

      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          switchToRegister={() => {
            setShowLogin(false);
            setShowRegister(true);
          }}
        />
      )}

      {showRegister && (
        <RegisterModal
          onClose={() => setShowRegister(false)}
          switchToLogin={() => {
            setShowRegister(false);
            setShowLogin(true);
          }}
        />
      )}

      {showAddProduct && (
        <AddProductModal
          onClose={() => setShowAddProduct(false)}
          onProductAdded={handleProductAdded}
        />
      )}
    </div>
  );
};

export default Account;
