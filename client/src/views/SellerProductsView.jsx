import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import * as api from '@/services/api';
import ProductCard from '@/components/ProductCard/ProductCard';
import './SellerProductsView.css';

const SellerProductsView = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isSeller } = useAuth();

  useEffect(() => {
    console.log('SellerProductsView:', {
      user,
      isSeller,
      role: user?.role
    });

    if (!isSeller) {
      console.log('Not a seller, redirecting...');
      window.location.href = '/';
      return;
    }
    
    fetchSellerProducts();
  }, [isSeller, user]);

  const fetchSellerProducts = async () => {
    try {
      const { data } = await api.getSellerProducts();
      console.log('Fetched seller products:', data);
      setProducts(data);
    } catch (error) {
      console.error('Error fetching seller products:', error);
      toast.error('Failed to load your products');
    } finally {
      setLoading(false);
    }
  };

  const handleProductUpdated = (updatedProduct) => {
    setProducts(prevProducts => 
      prevProducts.map(product => 
        product._id === updatedProduct._id ? updatedProduct : product
      )
    );
    toast.success('Product updated successfully');
  };

  const handleProductDeleted = (deletedProductId) => {
    setProducts(prevProducts => 
      prevProducts.filter(product => product._id !== deletedProductId)
    );
  };

  if (loading) {
    return <div className="loading">Loading your products...</div>;
  }

  return (
    <div className="seller-products">
      <h1>My Products</h1>
      <div className="debug-info" style={{ background: '#f5f5f5', padding: '10px', margin: '10px 0' }}>
        <pre>
          {JSON.stringify({
            userEmail: user?.email,
            userRole: user?.role,
            isSeller,
            productsCount: products.length
          }, null, 2)}
        </pre>
      </div>
      
      {products.length === 0 ? (
        <p className="no-products">You haven't added any products yet.</p>
      ) : (
        <div className="products-grid">
          {products.map(product => (
            <ProductCard
              key={product._id}
              product={product}
              onProductUpdated={handleProductUpdated}
              onProductDeleted={handleProductDeleted}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerProductsView;
