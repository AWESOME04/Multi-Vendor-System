import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import Product from "./Product/Product";
import "./Products.css";
import Skeleton from "react-loading-skeleton";
import * as api from '@/services/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await api.getProducts();
        console.log('Products data:', data);
        
        if (data?.products && Array.isArray(data.products)) {
          setProducts(data.products);
        } else {
          console.log('Invalid products data:', data);
          setProducts([]);
          toast.error('No products available');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to fetch products');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const canAddToCart = user?.role?.toUpperCase() === 'BUYER';

  return (
    <div className="sub-container" id="products">
      <h2>Products</h2>
      <div className="products-grid">
        {loading ? (
          // Show loading skeletons
          Array(8).fill(null).map((_, index) => (
            <div key={index} className="product-skeleton">
              <Skeleton height={200} />
              <Skeleton count={3} />
            </div>
          ))
        ) : products.length > 0 ? (
          // Show products
          products.map((product) => (
            <Product
              key={product.id}
              product={product}
              showAddToCart={canAddToCart}
            />
          ))
        ) : (
          // Show no products message
          <div className="no-products">
            <p>No products available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
