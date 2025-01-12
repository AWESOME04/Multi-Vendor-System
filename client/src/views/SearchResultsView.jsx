import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as api from '@/services/api';
import ProductCard from '@/components/ProductCard/ProductCard';
import './SearchResultsView.css';

const SearchResultsView = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const query = searchParams.get('q') || '';

  useEffect(() => {
    const searchProducts = async () => {
      setLoading(true);
      try {
        const data = await api.searchProducts(query);
        setProducts(data);
      } catch (error) {
        console.error('Error searching products:', error);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      searchProducts();
    }
  }, [query]);

  if (loading) {
    return <div className="search-results-loading">Searching for products...</div>;
  }

  return (
    <div className="search-results-view">
      <h1>Search Results for "{query}"</h1>
      
      {products.length === 0 ? (
        <div className="no-results-found">
          <p>No products found matching your search.</p>
          <p>Try using different keywords or check your spelling.</p>
        </div>
      ) : (
        <>
          <p className="results-count">{products.length} products found</p>
          <div className="products-grid">
            {products.map(product => (
              <ProductCard
                key={product._id}
                product={product}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default SearchResultsView;
