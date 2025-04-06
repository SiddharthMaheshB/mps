import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Cart.css'; // Reuse cart styling
import { useShop } from '../context/ShopContext';
import './OrderHistory.css';

const OrderHistory = () => {
  const { fetchOrders, orderLoading, orders: contextOrders, clearAllOrders, showNotification } = useShop();
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

  // First, check if we already have orders in localStorage
  useEffect(() => {
    const getInitialOrders = () => {
      try {
        // Check for dummy orders in localStorage first for immediate display
        const storedOrders = localStorage.getItem('dummyOrders');
        if (storedOrders) {
          const parsedOrders = JSON.parse(storedOrders);
          if (Array.isArray(parsedOrders) && parsedOrders.length > 0) {
            console.log('Using stored dummy orders for immediate display');
            setOrders(parsedOrders);
            
            // Automatically expand the most recent order
            if (parsedOrders.length > 0) {
              setExpandedOrders({
                [parsedOrders[0]._id]: true
              });
            }
            
            setLoading(false);
            // Still fetch from API but we already have data to show
            fetchOrdersFromAPI(false);
            return;
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
      const fetchedOrders = await fetchOrders();
      setOrders(fetchedOrders);
      
      // Automatically expand the most recent order if none are expanded yet
      if (fetchedOrders.length > 0 && Object.keys(expandedOrders).length === 0) {
        setExpandedOrders({
          [fetchedOrders[0]._id]: true
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
          {orders.length > 0 && (
            <button 
              className="clear-orders-btn" 
              onClick={handleClearAllOrders}
              title="Remove all orders from history"
            >
              Clear All Orders
            </button>
          )}
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