import { useState } from 'react';
import { FaShoppingCart, FaUser } from 'react-icons/fa';
import { useGlobalContext } from '@/components/GlobalContext/GlobalContext';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';
import LoginModal from '@/components/Auth/LoginModal';
import RegisterModal from '@/components/Auth/RegisterModal';
import AddProductModal from '@/components/Products/AddProductModal';
import './Account.css';

const Account = () => {
  const store = useGlobalContext();
  const { user, logout } = useAuth();
  const cartTotal = store.state.cartQuantity;
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const handleProductAdded = (newProduct) => {
    // Refresh products list
    store.getProducts();
  };

  return (
    <div className="account" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
      {user?.role === 'buyer' && (
        <div className="cart">
          <Link to="/cart">
            <span className="account-details">
              <FaShoppingCart />
              <span className="items-in-cart">{cartTotal}</span>
            </span>
          </Link>
        </div>
      )}

      {user ? (
        <div className="user-menu">
          <button onClick={() => setShowUserMenu(!showUserMenu)} className="user-button">
            <FaUser /> {user.name}
          </button>
          {showUserMenu && (
            <div className="user-menu-content">
              <Link to="/profile" className="user-menu-item">View Profile</Link>
              {user.role === 'buyer' && (
                <Link to="/orders" className="user-menu-item">My Orders</Link>
              )}
              {user.role === 'seller' && (
                <>
                  <Link to="/seller/products" className="user-menu-item">View Products</Link>
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
