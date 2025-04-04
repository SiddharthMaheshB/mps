import React from 'react';
import { Link } from 'react-router-dom';
import './Shop.css';
import { useState } from 'react';

const ProductCard = ({ product }) => {
    const [quantity, setQuantity] = useState(1);
  
    return (
      <div className="product-card">

        <img src={product.image} alt={product.name} className="product-image" />
        <Link to={`/shop/product/${product.id}`} className="view-details" style={{textDecoration:"none"}}><h3 style={{ margin:"8px", marginBottom:"0px"}}>{product.name}</h3></Link>
        <p>Price: ₹{product.price} per kg</p>
        
        {/* Quantity Selection */}
        <div className='input-quantity'>
        
        <label htmlFor={`quantity-${product.id}`} className="quantity-label">Quantity:</label>
        
        <select
          id={`quantity-${product.id}`}
          className="quantity-select"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        >
          {[1, 2, 3, 5, 10].map((kg) => (
            <option key={kg} value={kg}>{kg} kg</option>
          ))}
        </select>
        </div>
          
        {/* Total Price */}
        <p className="total-price">Total: ₹{product.price * quantity}</p>
  
        
        <button className='Cart'>Add to Basket</button>
      </div>
    );
  };

  export default ProductCard