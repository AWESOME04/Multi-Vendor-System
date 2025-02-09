import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import Product from "./Product/Product";
import Skeleton from "react-loading-skeleton";
import * as api from '@/services/api';
import "./Products.css";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await api.getProducts();
      if (data?.products && Array.isArray(data.products)) {
        setProducts(data.products);
      } else {
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

  return (
    <div className="products-container">
      <h2>Products</h2>
      <div className="products-grid">
        {loading ? (
          Array(6).fill(null).map((_, index) => (
            <div key={index} className="product-skeleton">
              <Skeleton height={200} />
              <Skeleton count={3} />
            </div>
          ))
        ) : products.length > 0 ? (
          products.map((product) => (
            <Product
              key={product.id}
              product={product}
              showAddToCart={user?.role?.toUpperCase() === 'BUYER'}
            />
          ))
        ) : (
          <div className="no-products">
            <p>No products available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
