import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Cart.css'; // Reuse cart styling
import { useShop } from '../context/ShopContext';
import './OrderHistory.css';

const OrderHistory = () => {
  const { fetchOrders, orderLoading, orders: contextOrders, clearAllOrders, hardReset, showNotification } = useShop();
  const [orders, setOrders] = useState([]);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [loading, setLoading] = useState(true);

  // Handler for clearing all orders
  const handleClearAllOrders = () => {
    // Show confirmation dialog
    if (window.confirm("Are you sure you want to clear all orders? This action cannot be undone.")) {
      const success = clearAllOrders();
      if (success) {
        setOrders([]);
        showNotification("All orders have been cleared");
      } else {
        showNotification("Failed to clear orders. Please try again.");
      }
    }
  };
  
  // Handler for hard reset (completely removes all order data)
  const handleHardReset = () => {
    // Show confirmation dialog with stronger warning
    if (window.confirm("WARNING: This will permanently remove ALL orders data for ALL users. This cannot be undone. Are you absolutely sure?")) {
      // Ask for double confirmation
      if (window.confirm("FINAL WARNING: This is a drastic action that affects all users. Press OK to confirm.")) {
        const success = hardReset();
        if (success) {
          setOrders([]);
          showNotification("Order data has been completely reset");
        } else {
          showNotification("Failed to reset data. Please try again.");
        }
      }
    }
  };

  // First, check if we already have orders in localStorage
  useEffect(() => {
    const getInitialOrders = () => {
      try {
        // Get current user ID
        const currentUserId = localStorage.getItem('userId');
        if (!currentUserId) {
          console.error('No userId found when loading order history');
          setOrders([]);
          setLoading(false);
          return;
        }
        
        // Check for dummy orders in localStorage first for immediate display
        const storedOrders = localStorage.getItem('dummyOrders');
        if (storedOrders) {
          const parsedOrders = JSON.parse(storedOrders);
          if (Array.isArray(parsedOrders) && parsedOrders.length > 0) {
            // Filter to get only current user's orders
            const userOrders = parsedOrders.filter(order => order.userId === currentUserId);
            
            console.log(`Found ${userOrders.length} orders for user ${currentUserId} (out of ${parsedOrders.length} total)`);
            
            if (userOrders.length > 0) {
              // Sort orders by date (newest first)
              const sortedOrders = userOrders.sort((a, b) => 
                new Date(b.createdAt) - new Date(a.createdAt)
              );
              
              setOrders(sortedOrders);
              
              // Automatically expand the most recent order
              setExpandedOrders({
                [sortedOrders[0]._id]: true
              });
              
              setLoading(false);
              // Still fetch from API but we already have data to show
              fetchOrdersFromAPI(false);
              return;
            }
          }
        }
        
        // No stored orders, fetch from API with loading indicator
        fetchOrdersFromAPI(true);
      } catch (error) {
        console.error('Error loading initial orders:', error);
        fetchOrdersFromAPI(true);
      }
    };
    
    getInitialOrders();
  }, []);
  
  // Separate function to fetch orders from API
  const fetchOrdersFromAPI = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    
    try {
      // Get current user ID
      const currentUserId = localStorage.getItem('userId');
      if (!currentUserId) {
        console.error('No userId found when fetching orders from API');
        setOrders([]);
        setLoading(false);
        return;
      }
      
      const fetchedOrders = await fetchOrders();
      
      // Filter to get only current user's orders
      const userOrders = fetchedOrders.filter(order => order.userId === currentUserId);
      
      console.log(`Filtered ${userOrders.length} orders for user ${currentUserId} (out of ${fetchedOrders.length} total)`);
      
      setOrders(userOrders);
      
      // Automatically expand the most recent order if none are expanded yet
      if (userOrders.length > 0 && Object.keys(expandedOrders).length === 0) {
        setExpandedOrders({
          [userOrders[0]._id]: true
        });
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return new Date(dateString).toLocaleDateString('en-US', options);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const toggleOrderDetails = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'status-pending';
      case 'delivered': return 'status-delivered';
      case 'shipped': return 'status-shipped';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  };

  // Loading skeleton for better UX
  const renderLoadingSkeleton = () => (
    <div className="orders-container">
      <h2 className="cart-title">Order History</h2>
      <div className="loading-skeleton">
        {[1, 2].map(i => (
          <div key={i} className="skeleton-order-item">
            <div className="skeleton-header"></div>
            <div className="skeleton-content">
              <div className="skeleton-line"></div>
              <div className="skeleton-line"></div>
              <div className="skeleton-line"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="cart-page">
        {renderLoadingSkeleton()}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="cart-page">
        <div className="orders-container">
          <div className="order-header-container">
            <h2 className="cart-title">Order History</h2>
          </div>
          <div className="empty-cart-container">
            <div className="cart-empty">
              <div className="empty-orders-icon">📋</div>
              <p>You haven't placed any orders yet.</p>
              <p className="empty-orders-subtext">Your order history will appear here after you make a purchase.</p>
              <Link to="/shop" className="continue-shopping">Shop Now</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="orders-container">
        <div className="order-header-container">
          <h2 className="cart-title">Order History</h2>
          <div className="order-actions">
            {orders.length > 0 && (
              <button 
                className="clear-orders-btn" 
                onClick={handleClearAllOrders}
                title="Remove all orders from history"
              >
                Clear My Orders
              </button>
            )}
          </div>
        </div>
        
        {orders.map(order => (
          <div key={order._id} className="order-item">
            <div 
              className="order-header" 
              onClick={() => toggleOrderDetails(order._id)}
            >
              <div className="order-summary">
                <h3>Order #{typeof order._id === 'string' ? order._id.slice(-8) : 'N/A'}</h3>
                <p>Placed on: {formatDate(order.createdAt)}</p>
                <p className="order-total">Total: ₹{order.totalAmount ? order.totalAmount.toFixed(2) : '0.00'}</p>
                {/* Status information commented out for now
                <p className="order-status">
                  Status: <span className={getStatusClass(order.status)}>
                    {order.status || 'Processing'}
                  </span>
                </p>
                */}
              </div>
              <div className="order-toggle">
                {expandedOrders[order._id] ? '−' : '+'}
              </div>
            </div>
            
            {expandedOrders[order._id] && (
              <div className="order-details">
                <h4>Items</h4>
                <div className="order-items-list">
                  <div className="order-detail-item" style={{fontWeight: 'bold'}}>
                    <span className="item-name">Product</span>
                    <span className="item-quantity">Quantity</span>
                    <span className="item-price">Price</span>
                    <span className="item-subtotal">Subtotal</span>
                  </div>
                  
                  {order.items && order.items.map((item, idx) => (
                    <div key={idx} className="order-detail-item">
                      <span className="item-name">
                        <strong>{item.name}</strong>
                        {item.description && <div className="item-description">{item.description}</div>}
                      </span>
                      <span className="item-quantity">
                        {item.quantity} {item.unit}
                      </span>
                      <span className="item-price">
                        ₹{item.price ? item.price.toFixed(2) : '0.00'}
                      </span>
                      <span className="item-subtotal">
                        ₹{(item.price && item.quantity) ? (item.price * item.quantity).toFixed(2) : '0.00'}
                      </span>
                    </div>
                  ))}
                </div>
                
                {/* Shipping address section commented out for now
                <h4>Shipping Address</h4>
                <div className="order-address">
                  {order.shippingAddress ? (
                    <>
                      <p>{order.shippingAddress.address}</p>
                      <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                      <p>{order.shippingAddress.country}</p>
                    </>
                  ) : (
                    <p>No shipping address available</p>
                  )}
                </div>
                */}
                
                {/* Payment method section commented out for now
                <h4>Payment Method</h4>
                <div className="order-payment">
                  <p>{order.paymentMethod || 'Not specified'}</p>
                </div>
                */}
              </div>
            )}
          </div>
        ))}
        
        <div className="orders-footer">
          <Link to="/shop" className="back-to-shop-btn">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
};

export default OrderHistory; 