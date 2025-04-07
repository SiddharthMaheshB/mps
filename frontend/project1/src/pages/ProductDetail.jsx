import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ProductDetail.css';
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

const ProductDetail = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedUnit, setSelectedUnit] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const navigate = useNavigate();
  const { showNotification } = useShop(); // Use the global notification context

  // Determine available unit options based on product type
  const getUnitOptions = (product) => {
    if (!product) return [];
    
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
  
  // Calculate price based on selected quantity and unit
  const calculatePrice = () => {
    if (!product) return 0;
    
    const unitOptions = getUnitOptions(product);
    const baseUnitValue = 1; // 1kg or 1Litre
    const selectedOption = unitOptions.find(option => option.label === selectedUnit);
    if (!selectedOption) return product.price * quantity;
    
    const unitRatio = selectedOption.value / baseUnitValue;
    return product.price * unitRatio * quantity;
  };

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/shop/products/${productId}`);
        setProduct(response.data);
        
        // Set default selected unit based on product type
        const unitOptions = getUnitOptions(response.data);
        if (unitOptions.length > 0) {
          setSelectedUnit(unitOptions[2].label); // Default to 1kg or 1L option (index 2)
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Failed to load product details. Please try again later.');
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId]);

  // Add saveToLocalCart function
  const saveToLocalCart = (product, quantity, selectedUnit) => {
    try {
      // Get existing cart from localStorage or initialize empty array
      const existingCart = JSON.parse(localStorage.getItem('localCart') || '[]');
      
      const unitOptions = getUnitOptions(product);
      const selectedOption = unitOptions.find(option => option.label === selectedUnit);
      const unitRatio = selectedOption ? selectedOption.value : 1;
      
      // Check if product with same unit already exists in cart
      const existingItemIndex = existingCart.findIndex(item => 
        item.productId === product._id && item.selectedUnit === selectedUnit);
        
      if (existingItemIndex >= 0) {
        // Update quantity if product already in cart
        existingCart[existingItemIndex].quantity += quantity;
      } else {
        // Add new item to cart
        existingCart.push({
          productId: product._id,
          name: product.name,
          price: product.price * unitRatio,
          image: product.image,
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
      setAddingToCart(true);
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, redirecting to home');
        navigate('/');
        return;
      }
      
      // Calculate actual price based on selected unit
      const unitOptions = getUnitOptions(product);
      const selectedOption = unitOptions.find(option => option.label === selectedUnit);
      const unitRatio = selectedOption ? selectedOption.value : 1;
      const actualPrice = product.price * unitRatio;
      
      console.log('Adding to cart from product detail:', {
        productId: product._id,
        quantity: quantity,
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
        if (error.response.status === 401) {
          showNotification('Authentication required. Please log in.');
          setTimeout(() => navigate('/'), 2000);
          return;
        }
        
        showNotification(`Failed to add product to cart: ${error.response.data.message || 'Server error'}`);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        showNotification('Server not responding. Please try again later or check if the backend is running.');
      } else {
        // Something happened in setting up the request that triggered an Error
        showNotification('Failed to add product to cart. Please try again.');
      }
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading product details...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!product) {
    return <div className="not-found">Product not found</div>;
  }

  const unitOptions = getUnitOptions(product);

  return (
    <div className="product-detail-container">
      <div className="product-image-container">
        <img 
          src={getProductImage(product)} 
          alt={product.name} 
          className="product-detail-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/1.png"; // Default image
          }}
        />
        </div>

      <div className="product-info">
        <h1 className="product-title">{product.name}</h1>
        <p className="product-price">₹{product.price} per {product.isLiquid ? 'Litre' : 'kg'}</p>
        
        {product.description && (
          <div className="product-description">
            <h3>Description:</h3>
            <p>{product.description}</p>
            </div>
        )}

        <div className="product-selector-container">
          <div className="selector-group">
            <label htmlFor="unit" className="package-label">Package:</label>
            <select
              id="unit"
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              disabled={addingToCart}
              className="selector-input"
            >
              {unitOptions.map((option) => (
                <option key={option.label} value={option.label}>{option.label}</option>
              ))}
            </select>
          </div>

          <div className="selector-group">
            <label htmlFor="quantity" className="qty-label">Quantity:</label>
            <select
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              disabled={addingToCart}
              className="selector-input"
            >
              {[1, 2, 3, 5, 10].map((qty) => (
                <option key={qty} value={qty}>{qty}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="total-price">
          Total: ₹{calculatePrice().toFixed(2)}
      </div>

        <div className="action-buttons">
          <button 
            className="add-to-cart-btn" 
            onClick={handleAddToCart}
            disabled={addingToCart}
          >
            {addingToCart ? 'Adding...' : 'Add to Cart'}
      </button>
          <Link to="/shop/cart" className="view-cart">
            View Cart
          </Link>
    </div>

        <div className="back-link">
          <Link to="/shop">← Back to Shop</Link>
  </div>
      </div>
    </div>
  );
};

export default ProductDetail;
