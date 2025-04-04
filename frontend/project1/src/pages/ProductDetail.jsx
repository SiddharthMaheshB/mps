import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import './ProductDetail.css';

const products = [
  { 
    id: 2, 
    name: 'Organic Apples', 
    price: 90, 
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
    price: 55, 
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
    price: 80, 
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
  
  // Default selected size is '1kg' if available, else first one
  const defaultSize = product?.packSizes.find(p => p.size === '1kg')?.size || product?.packSizes[0].size;
  const [selectedSize, setSelectedSize] = useState(defaultSize);
  const [quantities, setQuantities] = useState({});
  const [basketClicked, setBasketClicked] = useState({});

  if (!product) {
    return <p>Product not found</p>;
  }

  const handleSizeClick = (size) => {
    setSelectedSize(size);
    // Reset quantity and button status for new size
    setBasketClicked(prev => ({ ...prev, [size]: false }));
  };

  const handleAddToBasket = () => {
    setBasketClicked(prev => ({ ...prev, [selectedSize]: true }));
    setQuantities(prev => ({ ...prev, [selectedSize]: 1 }));
  };

  const increment = () => {
    setQuantities(prev => ({
      ...prev,
      [selectedSize]: (prev[selectedSize] || 0) + 1
    }));
  };

  const decrement = () => {
    setQuantities(prev => {
      const newQty = (prev[selectedSize] || 0) - 1;
      if (newQty <= 0) {
        setBasketClicked(prev => ({ ...prev, [selectedSize]: false }));
        return { ...prev, [selectedSize]: 0 };
      }
      return { ...prev, [selectedSize]: newQty };
    });
  };

  const getPriceForSelectedSize = () => {
    const pack = product.packSizes.find(p => p.size === selectedSize);
    return pack ? pack.price : product.price;
  };

  const totalQuantity = Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
const totalPrice = Object.entries(quantities).reduce((sum, [size, qty]) => {
  const pack = product.packSizes.find(p => p.size === size);
  return sum + (pack ? pack.price * qty : 0);
}, 0);
const handleSave = () => {
  const selectedPacks = Object.entries(quantities)
    .filter(([_, qty]) => qty > 0)
    .map(([size, qty]) => {
      const pack = product.packSizes.find(p => p.size === size);
      return {
        size,
        quantity: qty,
        pricePerUnit: pack?.price,
        totalPrice: pack?.price * qty
      };
    });

  const payload = {
    productId: product.id,
    productName: product.name,
    productimage: product.image,
    selectedPacks,
    totalQuantity,
    totalPrice
  };

  console.log("Saving payload:", payload);

  alert("Saved successfully!"+totalPrice+" "+totalQuantity+" "+selectedPacks);
};
 



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

          {basketClicked[selectedSize] ? (
            <div className="quantity-selector">
              <button onClick={decrement}>-</button>
              <span>{quantities[selectedSize]}</span>
              <button onClick={increment}>+</button>
            </div>
          ) : (
            <button className="add-to-cart" onClick={handleAddToBasket}>
              Add to Basket
            </button>
          )}

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
                <button
                  key={index}
                  className={`pack-option ${selectedSize === pack.size ? 'selected' : ''}`}
                  onClick={() => handleSizeClick(pack.size)}
                >
                  {pack.size} - ₹{pack.price}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Product Description */}
      <div className="product-description">
        <h3>Description</h3>
        <p>{product.description}</p>
            
        {/* Optional Total Price Summary */}
        {totalQuantity > 0 && (
  <div className="bottom-bar">
    <div className="bottom-bar-content">
      <div>
        <strong>Total: ₹{totalPrice}</strong> ({totalQuantity} items)
      </div>
      <button className="save-button" onClick={handleSave}>
        Save
      </button>
    </div>
  </div>
)}

      </div>
    </div>
  );
}
