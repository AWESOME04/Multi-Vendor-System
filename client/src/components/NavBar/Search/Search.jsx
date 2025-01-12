import { useState, useEffect, useRef } from 'react';
import { MdSearch } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import * as api from '@/services/api';
import './Search.css';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounce search
  useEffect(() => {
    setError(null); // Clear previous errors
    const timer = setTimeout(() => {
      if (query) {
        searchProducts();
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const searchProducts = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await api.searchProducts(query);
      setResults(Array.isArray(data) ? data : []);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
      setError('Unable to search products at the moment');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (productId) => {
    setShowResults(false);
    navigate(`/product/${productId}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setShowResults(false);
    }
  };

  return (
    <div className="search-container" ref={searchRef}>
      <form onSubmit={handleSubmit} className="search">
        <input
          type="text"
          placeholder="Search products by name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setShowResults(true)}
        />
        <button type="submit" disabled={loading}>
          <MdSearch size={20} />
        </button>
      </form>

      {showResults && (
        <div className="search-results">
          {loading ? (
            <div className="search-loading">Searching...</div>
          ) : error ? (
            <div className="search-error">{error}</div>
          ) : results.length > 0 ? (
            <ul>
              {results.map((product) => (
                <li key={product._id} onClick={() => handleProductClick(product._id)}>
                  <img src={product.img || 'https://via.placeholder.com/50'} alt={product.name} />
                  <div>
                    <h4>{product.name}</h4>
                    <p>${product.price}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : query && (
            <div className="no-results">No products found matching "{query}"</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
