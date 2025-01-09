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
        const { data } = await api.getProducts();
        setProducts(data.products || data);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const canAddToCart = user && user.role === 'BUYER';

  return (
    <div className="sub-container" id="products">
      <h2>Our Products</h2>
      {loading ? (
        <div className="skeleton">
          <Skeleton height={250} count={4} />
        </div>
      ) : (
        <div className="contains-product">
          {products.map((product) => (
            <Product 
              key={product._id || product.id} 
              product={{
                ...product,
                _id: product._id || product.id,
                name: product.name || product.title,
                image: product.image || product.image_url
              }}
              showAddToCart={canAddToCart}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
