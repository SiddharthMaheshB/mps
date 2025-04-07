import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Shop.css';
import ProductCard from './ProductCard';
import axios from 'axios';

export default function Shop({ login }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState({
    vegetables: [],
    fruits: [],
    dairy: []
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/shop/products');
        
        // Organize products by category
        const categorizedProducts = {
          vegetables: [],
          fruits: [],
          dairy: []
        };
        
        response.data.forEach(product => {
          if (categorizedProducts[product.category]) {
            categorizedProducts[product.category].push(product);
          }
        });
        
        setProducts(categorizedProducts);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (!login) {
    return <p>404 Not Found</p>;
  }

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="shop-container">
      <h1 className="main-title">Farm Products</h1>

      {/* Vegetables Section */}
      <h3 className="category-title">Vegetables</h3>
      <div className="product-grid">
        {products.vegetables.length > 0 ? (
          products.vegetables.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))
        ) : (
          <p>No vegetable products available</p>
        )}
      </div>

      {/* Fruits Section */}
      <h3 className="category-title">Fruits</h3>
      <div className="product-grid">
        {products.fruits.length > 0 ? (
          products.fruits.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))
        ) : (
          <p>No fruit products available</p>
        )}
      </div>

      {/* Dairy Products Section */}
      <h3 className="category-title">Dairy Products</h3>
      <div className="product-grid">
        {products.dairy.length > 0 ? (
          products.dairy.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))
        ) : (
          <p>No dairy products available</p>
        )}
      </div>
    </div>
  );
}

