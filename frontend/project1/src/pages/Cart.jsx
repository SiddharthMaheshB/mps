import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Cart.css";
import { useShop } from '../context/ShopContext';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [backendStatus, setBackendStatus] = useState('unknown');
  const [isLocalMode, setIsLocalMode] = useState(false);
  const [processingCheckout, setProcessingCheckout] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const navigate = useNavigate();
  const { clearCart, showNotification, processCheckout, addDummyOrder } = useShop();

  useEffect(() => {
    // Test backend connectivity
    testBackendConnectivity();
    
    // Fetch cart data
    fetchCart();

    // Clear cart count if cart is empty
    const localCart = JSON.parse(localStorage.getItem('localCart') || '[]');
    if (!localCart.length) {
      console.log('Cart page: Empty cart detected, triggering count reset');
      // Force update of cart badge by dispatching event
      window.dispatchEvent(new Event('cartUpdated'));
      
      // Directly set empty array in local storage to ensure clean slate
      localStorage.setItem('localCart', '[]');
      
      // Use the clearCart function from context if available
      if (clearCart) {
        clearCart();
      }
    }

    // Setup an interval to check if the cart badge needs to be cleared
    const intervalId = setInterval(() => {
      if (cartItems.length === 0) {
        console.log('Cart is still empty, ensuring badge is cleared');
        localStorage.setItem('localCart', '[]');
        window.dispatchEvent(new Event('cartUpdated'));
      }
    }, 2000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [clearCart]);

  const testBackendConnectivity = async () => {
    try {
      // Check if the server is responding at all
      const healthResponse = await axios.get('http://localhost:5000/health');
      console.log('Backend health check:', healthResponse.data);
      setBackendStatus('online');
      
      // Try to get products (doesn't require auth)
      const productsResponse = await axios.get('http://localhost:5000/api/shop/products');
      console.log('Products API response:', { 
        status: productsResponse.status, 
        count: productsResponse.data.length 
      });
      
      // If we have a token, try an authenticated request
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const config = {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          };
          const userTest = await axios.get('http://localhost:5000/api/auth/profile', config);
          console.log('Auth check successful:', userTest.data.username || 'User verified');
        } catch (authError) {
          console.error('Auth check failed:', authError.response?.status, authError.response?.data);
          if (authError.response?.status === 401) {
            console.log('Token expired or invalid - will need to login again');
          }
        }
      } else {
        console.log('No authentication token found');
      }
    } catch (error) {
      console.error('Backend connectivity test failed:', error);
      setBackendStatus('offline');
      setError('Unable to connect to the server. Using local cart mode.');
      setIsLocalMode(true);
      // Load local cart data
      loadLocalCart();
    }
  };

  const loadLocalCart = () => {
    try {
      const localCart = JSON.parse(localStorage.getItem('localCart') || '[]');
      console.log('Loaded local cart:', localCart);
      
      // Transform to match the API format for consistent handling
      const formattedItems = localCart.map(item => ({
        _id: item.productId, // Using productId as the item id in local mode
        product: {
          _id: item.productId,
          name: item.name,
          image: item.image,
          unit: item.unit
        },
        price: item.price,
        quantity: item.quantity
      }));
      
      setCartItems(formattedItems);
      setLoading(false);
    } catch (error) {
      console.error('Error loading local cart:', error);
      setCartItems([]);
      setLoading(false);
    }
  };

  const fetchCart = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      console.log('Fetching cart with token:', token ? 'Token exists' : 'No token');
      const response = await axios.get('http://localhost:5000/api/shop/cart', config);
      console.log('Cart response:', response.data);
      
      setCartItems(response.data.items || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching cart:', err);
      
      if (err.response?.status === 401) {
        // Clear token and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userId');
        setError("Session expired. Please log in again.");
        navigate('/');
        return;
      }
      
      // Fall back to local storage if backend fails
      setIsLocalMode(true);
      setError('Failed to load cart from server. Using local cart data.');
      loadLocalCart();
    }
  };

  const removeItem = async (itemId) => {
    if (isLocalMode) {
      // Handle remove in local mode
      try {
        const localCart = JSON.parse(localStorage.getItem('localCart') || '[]');
        const updatedCart = localCart.filter(item => item.productId !== itemId);
        localStorage.setItem('localCart', JSON.stringify(updatedCart));
        
        // Update the cart items locally
        setCartItems(prevItems => prevItems.filter(item => item._id !== itemId));
      } catch (err) {
        console.error('Error removing item from local cart:', err);
        alert('Failed to remove item. Please try again.');
      }
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      await axios.delete(`http://localhost:5000/api/shop/cart/items/${itemId}`, config);
      
      // Update the cart items locally
      setCartItems(prevItems => prevItems.filter(item => item._id !== itemId));
    } catch (err) {
      console.error('Error removing item from cart:', err);
      alert('Failed to remove item. Please try again.');
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (isLocalMode) {
      // Handle quantity update in local mode
      try {
        const localCart = JSON.parse(localStorage.getItem('localCart') || '[]');
        
        // If quantity <= 0, remove the item
        if (quantity <= 0) {
          const updatedCart = localCart.filter(item => item.productId !== itemId);
          localStorage.setItem('localCart', JSON.stringify(updatedCart));
          setCartItems(prevItems => prevItems.filter(item => item._id !== itemId));
          return;
        }
        
        // Otherwise update the quantity
        const updatedCart = localCart.map(item => 
          item.productId === itemId 
            ? { ...item, quantity } 
            : item
        );
        
        localStorage.setItem('localCart', JSON.stringify(updatedCart));
        
        // Update the UI
        setCartItems(prevItems => 
          prevItems.map(item => 
            item._id === itemId 
              ? { ...item, quantity } 
              : item
          )
        );
      } catch (err) {
        console.error('Error updating quantity in local cart:', err);
        alert('Failed to update quantity. Please try again.');
      }
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      // If quantity is 0 or less, remove the item
      if (quantity <= 0) {
        await removeItem(itemId);
        return;
      }

      await axios.put(
        `http://localhost:5000/api/shop/cart/items/${itemId}`, 
        { quantity }, 
        config
      );

      // Update the cart items locally
      setCartItems(prevItems => 
        prevItems.map(item => 
          item._id === itemId 
            ? { ...item, quantity } 
            : item
        )
      );
    } catch (err) {
      console.error('Error updating quantity:', err);
      alert('Failed to update quantity. Please try again.');
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      showNotification("Your cart is empty!");
      return;
    }

    try {
      setProcessingCheckout(true);
      setCheckoutError(null);
      
      // Calculate order total for both local and server modes
      const total = calculateTotal();
      
      // Format items in a consistent way for both local and server orders
      const orderItems = cartItems.map(item => ({
        productId: item.product._id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
        unit: item.unit || item.product.unit
      }));
      
      // Create a copy of the cart items before clearing
      const itemsForOrder = [...orderItems];
      
      if (isLocalMode) {
        // Handle checkout in local mode - create a dummy order
        const newOrder = addDummyOrder(itemsForOrder, total);
        
        // Only show notification and clear cart if order was created
        if (newOrder && newOrder._id) {
          showNotification("Order placed successfully! Thank you for your purchase.");
          
          // Clear the cart AFTER order is created
          localStorage.removeItem('localCart');
          setCartItems([]);
          
          if (clearCart) {
            clearCart();
          }
          
          // Force a cart update
          window.dispatchEvent(new Event('cartUpdated'));
          
          // Navigate to shop page instead of order history
          navigate('/shop');
        } else {
          showNotification("Failed to create order. Please try again.");
        }
        return;
      }
      
      // Get user token for authentication
      const token = localStorage.getItem('token');
      if (!token) {
        showNotification("Please log in to complete your purchase");
        navigate('/');
        return;
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      // Prepare order data
      const orderData = {
        items: orderItems,
        totalAmount: total
      };
      
      console.log('Submitting order to backend:', orderData);
      
      // Always use demo mode for this app
      const demoMode = true;
      
      let serverSuccess = false;
      
      try {
        // Try server call with timeout
        const serverPromise = axios.post(
          'http://localhost:5000/api/shop/orders',
          orderData,
          {...config, timeout: 3000} // 3 second timeout
        );
        
        const response = await serverPromise;
        console.log('Order created successfully:', response.data);
        serverSuccess = true;
      } catch (serverError) {
        console.error('Server error during checkout:', serverError);
        
        if (!demoMode) {
          // In production mode, we would throw the error to be caught by outer catch
          throw serverError;
        }
        
        // In demo mode, continue as if successful
        console.log('Demo mode: Simulating successful checkout despite server error');
      }
      
      // Always create a dummy order with a unique ID in demo mode
      // Even if server was successful, create a local copy for the order history
      const newOrder = addDummyOrder(itemsForOrder, total);
      
      if (!newOrder || !newOrder._id) {
        throw new Error("Failed to create order");
      }
      
      // Clear the cart items
      try {
        if (!demoMode && serverSuccess) {
          // Try to clear items on server only if server call was successful
          for (const item of cartItems) {
            try {
              await axios.delete(`http://localhost:5000/api/shop/cart/items/${item._id}`, config);
            } catch (deleteError) {
              console.error('Error removing item from cart after order:', deleteError);
            }
          }
        }
      } catch (clearError) {
        console.log('Error clearing cart on server, continuing with local cleanup');
      }
      
      // Clear the local cart state and localStorage
      setCartItems([]);
      localStorage.removeItem('localCart'); // Remove completely first
      localStorage.setItem('localCart', '[]'); // Then set empty array
      
      // Use the clearCart function from context to ensure complete cleanup
      if (clearCart) {
        clearCart();
      }
      
      // Force a cart update event to refresh all components
      window.dispatchEvent(new Event('cartUpdated'));
      
      // Show success notification
      showNotification("Order placed successfully! Thank you for your purchase.");
      
      // Redirect to shop page instead of order history
      navigate('/shop');
      
    } catch (error) {
      console.error('Error during checkout:', error);
      
      setCheckoutError(error.message || 'Checkout failed. Please try again.');
      showNotification(error.message || 'Checkout failed. Please try again.');
    } finally {
      setProcessingCheckout(false);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  if (loading) {
    return <div className="loading">Loading your cart...</div>;
  }

  return (
    <div className="cart-page">
      <h2 className="cart-title">
        Your Cart
        {isLocalMode && <span className="local-mode-badge"> (Local Mode)</span>}
      </h2>
      
      <div className="cart-content">
        {error && <div className="info-message">{error}</div>}

      {cartItems.length === 0 ? (
          <div className="empty-cart-container">
            <div className="cart-empty">
              <p>Your cart is empty.</p>
              <Link to="/shop" className="continue-shopping">Continue Shopping</Link>
            </div>
          </div>
      ) : (
        <div className="cart-items-container">
          {cartItems.map((item) => (
              <div key={item._id} className="cart-item">
                <img 
                  src={item.product.image.startsWith('http') ? item.product.image : `/${item.product.image}`} 
                  alt={item.product.name} 
                  className="cart-item-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/1.png"; // Default image
                  }}
                />
              <div className="cart-item-details">
                  <Link to={`/shop/product/${item.product._id}`} style={{ textDecoration: "none", color: "black" }}>
                    <h3>{item.product.name}</h3>
                </Link>

                  <div className="cart-package">
                    <div className="package-info">
                      <p>₹{item.price} per {item.product.unit} × {item.quantity} = ₹{item.price * item.quantity}</p>
                      <div className="quantity-controls">
                        <button onClick={() => updateQuantity(item._id, item.quantity - 1)}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</button>
                      </div>
                    </div>
                    <button className="cart-remove-btn" onClick={() => removeItem(item._id)}>✖</button>
                  </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>

      {/* Fixed Checkout Section */}
      <div className="cart-footer">
        <p className="cart-total">Total: ₹{calculateTotal()}</p>
        <button 
          className="cart-checkout-btn" 
          onClick={handleCheckout}
          disabled={cartItems.length === 0 || processingCheckout}
        >
          {processingCheckout ? 'Processing...' : 'Proceed to Checkout'}
        </button>
        {cartItems.length > 0 && (
          <Link to="/shop/order-history" className="view-orders-link">View Previous Orders</Link>
        )}
      </div>
      <br/>
      <br/>
    </div>
  );
};

export default Cart;
