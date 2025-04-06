import React, { createContext, useState, useContext, useEffect } from 'react';
import Notification from '../components/Notification';
import axios from 'axios';

// Create the context
const ShopContext = createContext();

// Custom hook to use the shop context
export const useShop = () => useContext(ShopContext);

// Provider component
export const ShopProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);
  const [orders, setOrders] = useState([]);
  const [orderLoading, setOrderLoading] = useState(false);
  
  // Fetch user orders
  const fetchOrders = async () => {
    try {
      setOrderLoading(true);
      const token = localStorage.getItem('token');
      
      // Always load cached orders first for immediate UI response
      const existingOrders = getExistingDummyOrders();
      setOrders(existingOrders); // Set immediately for better UI experience
      
      if (!token) {
        // If not logged in, just return existing dummy orders
        console.log('fetchOrders: No token, returning', existingOrders.length, 'cached orders');
        setOrderLoading(false);
        
        // Set last fetch time even for cached results
        localStorage.setItem('lastOrdersFetchTime', Date.now().toString());
        
        return existingOrders;
      }
      
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      try {
        // Add timeout of 2 seconds for faster fallback
        const response = await Promise.race([
          axios.get('http://localhost:5000/api/shop/orders', config),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('API timeout')), 2000)
          )
        ]);
        
        console.log('Orders fetched from API:', response.data.length);
        
        // Combine server orders with dummy orders
        const allOrders = [...response.data, ...existingOrders];
        
        // Sort by date (newest first)
        const sortedOrders = allOrders.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        console.log('Combined orders count:', sortedOrders.length);
        
        setOrders(sortedOrders);
        setOrderLoading(false);
        
        // Update last fetch time
        localStorage.setItem('lastOrdersFetchTime', Date.now().toString());
        
        return sortedOrders;
      } catch (apiError) {
        console.error('API error fetching orders:', apiError);
        
        // For demo purposes, return existing dummy orders
        // We already set these above, so just return them
        console.log('API error, using', existingOrders.length, 'cached orders');
        setOrderLoading(false);
        
        // Set last fetch time even for cached results
        localStorage.setItem('lastOrdersFetchTime', Date.now().toString());
        
        return existingOrders;
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrderLoading(false);
      
      // Return existing dummy orders
      const existingOrders = getExistingDummyOrders();
      setOrders(existingOrders);
      
      // Set last fetch time even for cached results
      localStorage.setItem('lastOrdersFetchTime', Date.now().toString());
      
      return existingOrders;
    }
  };
  
  // Get existing dummy orders without creating new ones
  const getExistingDummyOrders = () => {
    // Check if we have dummy orders in local storage
    const storedDummyOrders = localStorage.getItem('dummyOrders');
    if (storedDummyOrders) {
      try {
        const orders = JSON.parse(storedDummyOrders);
        if (Array.isArray(orders)) {
          return orders;
        }
      } catch (e) {
        console.error('Error parsing stored dummy orders:', e);
      }
    }
    
    // If no orders exist, return empty array
    return [];
  };
  
  // Get a specific order
  const getOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return null; // Not logged in
      }
      
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      try {
        const response = await axios.get(`http://localhost:5000/api/shop/orders/${orderId}`, config);
        return response.data;
      } catch (apiError) {
        console.error(`API error fetching order ${orderId}:`, apiError);
        
        // For demo, check if we have this order in our dummy orders
        const dummyOrders = getExistingDummyOrders();
        const dummyOrder = dummyOrders.find(order => order._id === orderId);
        return dummyOrder || null;
      }
    } catch (error) {
      console.error(`Error fetching order ${orderId}:`, error);
      return null;
    }
  };
  
  // Clear cart data completely
  const clearCart = () => {
    try {
      // Remove the cart completely first
      localStorage.removeItem('localCart');
      
      // Then set it to an empty array
      localStorage.setItem('localCart', '[]');
      
      console.log('ShopContext: Cart cleared');
      
      // Trigger multiple update events to ensure all components refresh
      setTimeout(() => {
        window.dispatchEvent(new Event('cartUpdated'));
        
        // Double-check after a short delay that cart is still empty
        setTimeout(() => {
          if (localStorage.getItem('localCart') !== '[]') {
            console.log('Cart not properly cleared, fixing...');
            localStorage.setItem('localCart', '[]');
            window.dispatchEvent(new Event('cartUpdated'));
          }
        }, 300);
      }, 50);
    } catch (error) {
      console.error('ShopContext: Error clearing cart', error);
      // Last resort fallback
      localStorage.setItem('localCart', '[]');
    }
  };
  
  // Function to show notification
  const showNotification = (message) => {
    setNotification(message);
    
    // Dispatch cart updated event to refresh cart count
    if (message && message.includes('Added')) {
      console.log('Dispatching cartUpdated event after adding item');
      setTimeout(() => {
        window.dispatchEvent(new Event('cartUpdated'));
      }, 100);
    }
  };
  
  // Function to hide notification
  const hideNotification = () => {
    setNotification(null);
  };
  
  // Ensure cart data is valid on mount
  useEffect(() => {
    try {
      // Don't clear dummy orders anymore as we want orders to persist
      // localStorage.removeItem('dummyOrders');
      
      // Check if localCart exists
      const localCartStr = localStorage.getItem('localCart');
      
      // If localCart doesn't exist or is invalid, reset it
      if (!localCartStr || localCartStr === 'undefined' || localCartStr === 'null') {
        console.log('ShopContext: Cart data missing, creating empty cart');
        localStorage.setItem('localCart', '[]');
        return;
      }
      
      // Try to parse the cart data
      const localCart = JSON.parse(localCartStr);
      
      // Verify it's an array
      if (!Array.isArray(localCart)) {
        console.log('ShopContext: Invalid cart data detected, resetting');
        localStorage.setItem('localCart', '[]');
        return;
      }
      
      // If cart is empty, ensure it's properly formatted
      if (localCart.length === 0) {
        localStorage.setItem('localCart', '[]');
      } else {
        // Validate each item in the cart
        const validCart = localCart.filter(item => 
          item && typeof item === 'object' && item.productId && item.quantity > 0
        );
        
        if (validCart.length !== localCart.length) {
          console.log('ShopContext: Cleaned up invalid cart items');
          localStorage.setItem('localCart', JSON.stringify(validCart));
        }
      }
      
      // Trigger cart update
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('ShopContext: Error checking cart data', error);
      localStorage.setItem('localCart', '[]');
      window.dispatchEvent(new Event('cartUpdated'));
    }
    
    // Set up an interval to periodically validate cart data
    const intervalId = setInterval(() => {
      try {
        const emptyCart = localStorage.getItem('localCart') === '[]';
        const cartBadge = document.querySelector('.cart-badge');
        
        // If cart is empty but badge is visible, force update
        if (emptyCart && cartBadge) {
          console.log('ShopContext: Detected cart badge when cart is empty, forcing update');
          window.dispatchEvent(new Event('cartUpdated'));
        }
      } catch (e) {
        // Ignore errors in this check
      }
    }, 3000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, []);
  
  // Load orders on context initialization
  useEffect(() => {
    console.log('ShopContext: Initial orders load');
    
    // Check if orders were fetched recently
    const lastFetchTime = parseInt(localStorage.getItem('lastOrdersFetchTime') || '0');
    const currentTime = Date.now();
    const timeSinceLastFetch = currentTime - lastFetchTime;
    
    // Only fetch if it's been more than 30 seconds since the last fetch
    // This prevents redundant API calls when navigating between pages
    if (timeSinceLastFetch > 30000 || lastFetchTime === 0) {
      console.log('ShopContext: Fetching orders (no recent fetch)');
      fetchOrders().then(orders => {
        console.log('ShopContext: Initial orders loaded:', orders.length);
      }).catch(error => {
        console.error('ShopContext: Error loading initial orders:', error);
      });
    } else {
      console.log('ShopContext: Using recently cached orders');
      // Just load the cached orders from localStorage
      const existingOrders = getExistingDummyOrders();
      setOrders(existingOrders);
    }
  }, []);
  
  // Add a new dummy order (for demo mode)
  const addDummyOrder = (items, totalAmount) => {
    try {
      // Validate input
      if (!items || !Array.isArray(items) || items.length === 0) {
        console.error('Invalid items provided to addDummyOrder');
        return null;
      }
      
      // Create a new dummy order
      const now = new Date();
      
      // Enhance items with descriptions if not present
      const enhancedItems = items.map(item => {
        // If the item already has a description, use it
        if (item.description && item.imageUrl) return item;
        
        // Build basic item info
        let enhancedItem = {...item};
        
        // Add description if not present
        if (!enhancedItem.description) {
          if (item.name && item.name.toLowerCase().includes('tomato')) {
            enhancedItem.description = 'Fresh, locally grown tomatoes. Perfect for salads and sauces.';
          } else if (item.name && item.name.toLowerCase().includes('potato')) {
            enhancedItem.description = 'Organically grown potatoes. Great for frying, baking, or mashing.';
          } else if (item.name && item.name.toLowerCase().includes('milk')) {
            enhancedItem.description = 'Farm fresh milk from grass-fed cows. No added hormones.';
          } else if (item.name && item.name.toLowerCase().includes('apple')) {
            enhancedItem.description = 'Crisp, sweet apples picked at peak ripeness.';
          } else if (item.name && item.name.toLowerCase().includes('carrot')) {
            enhancedItem.description = 'Organic carrots with tops removed. Rich in vitamins.';
          } else {
            enhancedItem.description = 'Fresh farm produce, sourced directly from local farmers.';
          }
        }
        
        // Add imageUrl if not present
        if (!enhancedItem.imageUrl) {
          // Generate image URL based on product name
          enhancedItem.imageUrl = `/images/products/${item.name.toLowerCase().replace(/\s+/g, '-')}.jpg`;
        }
        
        return enhancedItem;
      });
      
      const newOrder = {
        _id: 'demo-order-' + Date.now(),
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        totalAmount: totalAmount || 0,
        items: enhancedItems || [],
        status: 'Processing'
      };
      
      // Get existing dummy orders
      let dummyOrders = [];
      try {
        const storedOrders = localStorage.getItem('dummyOrders');
        if (storedOrders) {
          const parsed = JSON.parse(storedOrders);
          if (Array.isArray(parsed)) {
            dummyOrders = parsed;
          }
        }
      } catch (e) {
        console.error('Error loading stored dummy orders:', e);
      }
      
      // Add the new order to the beginning of the array
      dummyOrders = [newOrder, ...dummyOrders];
      
      // Store back in localStorage
      localStorage.setItem('dummyOrders', JSON.stringify(dummyOrders));
      
      // Update the state
      setOrders(dummyOrders);
      
      console.log('New dummy order created:', newOrder._id);
      
      // Dispatch the orderUpdated event to notify other components
      setTimeout(() => {
        window.dispatchEvent(new Event('orderUpdated'));
        console.log('Dispatched orderUpdated event');
      }, 100);
      
      return newOrder;
    } catch (error) {
      console.error('Error creating dummy order:', error);
      return null;
    }
  };
  
  // Add function to clear all orders
  const clearAllOrders = () => {
    try {
      // Remove orders from localStorage
      localStorage.removeItem('dummyOrders');
      
      // Update state to empty array
      setOrders([]);
      
      console.log('All orders cleared successfully');
      
      // Dispatch the orderUpdated event to notify other components
      setTimeout(() => {
        window.dispatchEvent(new Event('orderUpdated'));
        console.log('Dispatched orderUpdated event after clearing orders');
      }, 100);
      
      return true;
    } catch (error) {
      console.error('Error clearing orders:', error);
      return false;
    }
  };
  
  return (
    <ShopContext.Provider 
      value={{ 
        showNotification,
        hideNotification,
        clearCart,
        orders,
        orderLoading,
        fetchOrders,
        getOrder,
        addDummyOrder,
        clearAllOrders
      }}
    >
      {children}
      {notification && (
        <Notification
          message={notification}
          onClose={hideNotification}
        />
      )}
    </ShopContext.Provider>
  );
};

export default ShopContext; 