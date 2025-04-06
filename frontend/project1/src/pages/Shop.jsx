import React from 'react';
import { Link } from 'react-router-dom';
import './Shop.css';
import { useState } from 'react';
import ProductCard from './ProductCard';
const products = {
  vegetables: [
    { id: 1, name: 'Fresh Carrots', price: 3, image: '4.jpg' },
    { id: 2, name: 'Tomatoes', price: 4, image: '3.jpg' },
   
  ],
  fruits: [
    { id: 3, name: 'Organic Apples', price: 5, image: '3.jpg' },
    { id: 4, name: 'Bananas', price: 2, image: '5.jpg' },
  ],
  dairy: [
    { id: 5, name: 'Dairy Milk', price: 7, image: '5.jpg' },
    { id: 6, name: 'Cheese', price: 10, image: '4.jpg' },
  ],
};

export default function Shop({ login }) {
  if (!login) {
    return <p>404 Not Found</p>;
  }

  return (
    <div className="shop-container">
      <h1 style={{textAlign:"center",marginLeft:"20%"}}>Farm Products</h1>

      {/* Vegetables Section */}
      <h3 className="category-title">Vegetables</h3>
      <div className="product-grid">
        {products.vegetables.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Fruits Section */}
      <h3 className="category-title">Fruits</h3>
      <div className="product-grid">
        {products.fruits.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Dairy Products Section */}
      <h3 className="category-title">Dairy Products</h3>
      <div className="product-grid">
        {products.dairy.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

