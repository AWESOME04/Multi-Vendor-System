import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import Product from "./Product/Product";
import "./Products.css";
import Skeleton from "react-loading-skeleton";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/products');
        setProducts(response.data.products);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

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
              key={product.product_id} 
              product={{
                ...product,
                _id: product.product_id,
                name: product.title,
                image: product.image_url
              }}
              showAddToCart={user?.role === 'buyer'}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
