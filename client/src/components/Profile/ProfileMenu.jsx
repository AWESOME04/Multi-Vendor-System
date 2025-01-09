import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import AddProductModal from '../Product/AddProductModal';
import './ProfileMenu.css';

const ProfileMenu = ({ onClose }) => {
  const { user, logout, isSeller } = useAuth();
  const [showAddProduct, setShowAddProduct] = useState(false);

  const handleLogout = () => {
    logout();
    onClose();
  };

  const handleAddProduct = () => {
    setShowAddProduct(true);
  };

  return (
    <>
      <div className="profile-menu">
        <div className="menu-header">
          <h3>{user.email}</h3>
          <p className="role">{user.role}</p>
        </div>
        <div className="menu-items">
          {isSeller && (
            <>
              <button onClick={handleAddProduct}>Add Product</button>
              <button onClick={() => window.location.href = '/seller/products'}>My Products</button>
            </>
          )}
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>
      {showAddProduct && (
        <AddProductModal onClose={() => setShowAddProduct(false)} />
      )}
    </>
  );
};

export default ProfileMenu;
