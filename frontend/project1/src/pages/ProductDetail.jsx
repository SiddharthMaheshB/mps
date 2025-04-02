import React from 'react';
import { useParams, Link } from 'react-router-dom';
import './ProductDetail.css';

const products = [
  { 
    id: 2, 
    name: 'Organic Apples', 
    price: 5, 
    image: '/3.jpg', 
    description: 'Fresh organic apples from local farms.', 
    packSizes: [
      { size: '500g', price: 50 },
      { size: '1kg', price: 90 },
      { size: '2kg', price: 170 }
    ]
  },
  { 
    id: 1, 
    name: 'Fresh Carrots', 
    price: 3, 
    image: '/4.jpg', 
    description: 'Crisp and fresh carrots directly from the farm.', 
    packSizes: [
      { size: '500g', price: 30 },
      { size: '1kg', price: 55 },
      { size: '2kg', price: 100 }
    ]
  },
  { 
    id: 3, 
    name: 'Dairy Milk', 
    price: 7, 
    image: '/5.jpg', 
    description: 'Pure and fresh dairy milk.', 
    packSizes: [
      { size: '250ml', price: 25 },
      { size: '500ml', price: 45 },
      { size: '1L', price: 80 }
    ]
  }
];

export default function ProductDetail() {
  const { productId } = useParams();
  const product = products.find((p) => p.id === parseInt(productId));

  if (!product) {
    return <p>Product not found</p>;
  }

  return (
    <div>
    <div className="product-detail">
      {/* Left Section - Images */}
      <div className="image-section">
        <img src={product.image} alt={product.name} className="product-image-large" />
      </div>

      {/* Right Section - Product Details */}
      <div className="details-section">
        <h2 className="product-title">{product.name}</h2>
        <p className="price-section">
          Price: ₹{product.price} <span className="original-price">₹{product.price + 20}</span>
        </p>
        <p className="discount">You Save: 43% OFF</p>

        <button className="add-to-cart">Add to Basket</button>
        <button className="save-for-later">Save for Later</button>

        {/* Offer Section */}
        <div className="offer-section">
          <p className="offer-title">Offers</p>
          <p className="offer-details">26% Off! Get up to 2 qty at ₹104 and additional at ₹111.</p>
        </div>

        {/* Pack Sizes */}
        <div className="pack-sizes">
          <h3>Pack Sizes</h3>
          <div className="pack-options">
            {product.packSizes.map((pack, index) => (
              <button key={index} className="pack-option">
                {pack.size} - ₹{pack.price}
              </button>
            ))}
          </div>
        </div>

        {/* Product Description */}
        
        
      </div>
      
    </div>
    <div className="product-description">
          <h3>Description</h3>
          <p>{product.description}</p>
        </div>
    </div>

  );
}
