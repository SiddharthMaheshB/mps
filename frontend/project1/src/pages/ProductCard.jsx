import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Shop.css';
import { useShop } from '../context/ShopContext';

// Import product images
import carrotImage from './product_images/Fresh Carrots.jpeg';
import tomatoImage from './product_images/Tamatoes.jpeg';
import appleImage from './product_images/Organic Apples.jpeg';
import bananaImage from './product_images/Banana.jpeg';
import milkImage from './product_images/Daily Milk.jpeg';
import cheeseImage from './product_images/Cheese.jpeg';

// Product image mapping
const productImageMap = {
  'Fresh Carrots': carrotImage,
  'Tomatoes': tomatoImage,
  'Organic Apples': appleImage,
  'Bananas': bananaImage,
  'Dairy Milk': milkImage,
  'Cheese': cheeseImage
};

// Helper function to get product image
const getProductImage = (product) => {
  // Use the image from the map if available
  if (productImageMap[product.name]) {
    return productImageMap[product.name];
  }
  
  // Fallback to the original image path
  return product.image.startsWith('http') ? product.image : `/${product.image}`;
};

const ProductCard = ({ product }) => {
    const [quantity, setQuantity] = useState(1);
    const [selectedUnit, setSelectedUnit] = useState(product.unit);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { showNotification } = useShop(); // Use the global notification context
    
    // Determine available unit options based on product type
    const getUnitOptions = () => {
      if (product.isLiquid) {
        // For liquid items like milk - only showing volume units
        return [
          { value: 0.25, label: '250ml' },
          { value: 0.5, label: '500ml' },
          { value: 1, label: '1 Litre' },
          { value: 2, label: '2 Litre' },
          { value: 5, label: '5 Litre' }
        ];
      } else {
        // For solid items like vegetables, fruits, etc. - only showing weight units
        return [
          { value: 0.25, label: '250g' },
          { value: 0.5, label: '500g' },
          { value: 1, label: '1 kg' },
          { value: 2, label: '2 kg' },
          { value: 5, label: '5 kg' }
        ];
      }
    };
    
    const unitOptions = getUnitOptions();
    
    // Set default selected unit on component mount
    useEffect(() => {
      // Set appropriate default unit based on whether product is liquid or solid
      if (product.isLiquid) {
        setSelectedUnit('1 Litre');
      } else {
        setSelectedUnit('1 kg');
      }
    }, [product.isLiquid]);
    
    // Calculate price based on selected quantity and unit
    const calculatePrice = () => {
      const baseUnitValue = 1; // 1kg or 1Litre
      const selectedOption = unitOptions.find(option => option.label === selectedUnit);
      if (!selectedOption) return product.price * quantity;
      
      const unitRatio = selectedOption.value / baseUnitValue;
      return product.price * unitRatio * quantity;
    };
    
    // Fallback function to save cart to localStorage
    const saveToLocalCart = (product, quantity, selectedUnit) => {
      try {
        // Get existing cart from localStorage or initialize empty array
        const existingCart = JSON.parse(localStorage.getItem('localCart') || '[]');
        
        // Generate a unique key that includes product ID and unit
        const itemKey = `${product._id}-${selectedUnit}`;
        
        // Get the correct image path using the mapping
        const imagePath = getProductImage(product);
        
        // Check if product with same unit already exists in cart
        const existingItemIndex = existingCart.findIndex(item => 
          item.productId === product._id && item.selectedUnit === selectedUnit);
          
        if (existingItemIndex >= 0) {
          // Update quantity if product already in cart
          existingCart[existingItemIndex].quantity += quantity;
        } else {
          // Add new item to cart
          const selectedOption = unitOptions.find(option => option.label === selectedUnit);
          const unitRatio = selectedOption ? selectedOption.value : 1;
          
          existingCart.push({
            productId: product._id,
            name: product.name,
            price: product.price * unitRatio,
            image: imagePath,
            unit: product.unit,
            selectedUnit: selectedUnit,
            quantity: quantity
          });
        }
        
        // Save updated cart back to localStorage
        localStorage.setItem('localCart', JSON.stringify(existingCart));
        
        console.log('Successfully saved to local cart:', existingCart);
        return true;
      } catch (error) {
        console.error('Error saving to local cart:', error);
        return false;
      }
    };
    
    const handleAddToCart = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('No token found, redirecting to home');
          navigate('/');
          return;
        }
        
        // Find selected option and calculate actual price
        const selectedOption = unitOptions.find(option => option.label === selectedUnit);
        const unitRatio = selectedOption ? selectedOption.value : 1;
        const actualPrice = product.price * unitRatio;
        
        console.log('Adding to cart:', {
          productId: product._id,
          quantity,
          unit: selectedUnit,
          price: actualPrice,
          token: token ? 'Token exists' : 'No token'
        });
        
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        };
        
        // First make sure the product exists and is available
        try {
          const productCheck = await axios.get(
            `http://localhost:5000/api/shop/products/${product._id}`, 
            config
          );
          console.log('Product verified:', productCheck.data);
        } catch (productError) {
          console.error('Product verification failed:', productError);
          // Continue anyway, as this is just a check
        }
        
        const cartData = {
          productId: product._id,
          quantity: quantity,
          price: actualPrice,
          unit: selectedUnit
        };
        
        console.log('Sending cart data:', cartData);
        
        const response = await axios.post(
          'http://localhost:5000/api/shop/cart/items', 
          cartData,
          config
        );
        
        console.log('Cart response:', response.data);
        
        // Show notification using context instead of local state
        showNotification(`Added ${quantity} ${selectedUnit} of ${product.name} to your cart!`);
        
      } catch (error) {
        console.error('Error adding to cart:', error);
        
        // Try local storage fallback
        const fallbackSuccess = saveToLocalCart(product, quantity, selectedUnit);
        
        if (fallbackSuccess) {
          showNotification(`Added ${quantity} ${selectedUnit} of ${product.name} to your cart! (Local mode)`);
          return;
        }
        
        // More detailed error handling
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('Error response:', error.response.data);
          console.error('Error status:', error.response.status);
          
          // Authentication check
          if (error.response?.status === 401) {
            showNotification('Authentication required. Please log in.');
            setTimeout(() => navigate('/'), 2000);
            return;
          }
          
          showNotification(`Failed to add to cart: ${error.response.data.message || 'Server error'}`);
        } else if (error.request) {
          // The request was made but no response was received
          console.error('No response received:', error.request);
          showNotification('Server not responding. Please try again later or check if the backend is running.');
        } else {
          // Something happened in setting up the request that triggered an Error
          showNotification('Failed to add to cart. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <div className="product-card">
        <img 
          src={getProductImage(product)} 
          alt={product.name} 
          className="product-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/1.png"; // Default image if the product image fails to load
          }}
        />
        <Link to={`/shop/product/${product._id}`} className="view-details" style={{textDecoration:"none"}}>
          <h3 style={{ margin:"8px", marginBottom:"0px"}}>{product.name}</h3>
        </Link>
        <p>Price: ₹{product.price} per {product.isLiquid ? 'Litre' : 'kg'}</p>
        
        {/* Quantity and Unit Selection */}
        <div className="product-selector-container">
          <div className="selector-group">
            <div className="package-selector">
              <label htmlFor={`unit-${product._id}`} className="package-label">Package:</label>
              <select
                id={`unit-${product._id}`}
                className="selector-input"
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                disabled={loading}
              >
                {unitOptions.map((option) => (
                  <option key={option.label} value={option.label}>{option.label}</option>
                ))}
              </select>
            </div>
            
            <div className="qty-selector">
              <label htmlFor={`quantity-${product._id}`} className="qty-label">Qty:</label>
              <select
                id={`quantity-${product._id}`}
                className="selector-input"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                disabled={loading}
              >
                {[1, 2, 3, 5, 10].map((qty) => (
                  <option key={qty} value={qty}>{qty}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
          
        {/* Total Price */}
        <p className="total-price">Total: ₹{calculatePrice().toFixed(2)}</p>
  
        <button 
          className='Cart' 
          onClick={handleAddToCart}
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add to Cart'}
        </button>
      </div>
    );
  };

  export default ProductCard