import React, { useState, useEffect, useRef } from 'react';
import '../pages/Shop.css';

const Notification = ({ message, onClose }) => {
  const [visible, setVisible] = useState(true);
  const closeTimeoutRef = useRef(null);
  const navigate = useRef(null);
  
  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  // Set initial auto-close timer
  useEffect(() => {
    // Close the notification after 3 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 3000);
    
    // Clean up on unmount or when component changes
    return () => clearTimeout(timer);
  }, []);

  // Handle notification close
  const handleClose = () => {
    // Set to invisible with a single state change
    setVisible(false);
    
    // Call onClose after animation completes
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    
    closeTimeoutRef.current = setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  };

  // Handle view cart action
  const handleViewCart = () => {
    handleClose();
    // Let the animation complete before navigating
    setTimeout(() => {
      window.location.href = '/shop/cart';
    }, 300);
  };

  // Handle view orders action for order confirmation
  const handleViewOrders = () => {
    handleClose();
    // Let the animation complete before navigating
    setTimeout(() => {
      window.location.href = '/shop/order-history';
    }, 300);
  };

  // Process message content
  let messageContent;
  let isSuccess = false;
  let isError = false;
  let isOrderConfirmation = false;
  
  if (message && message.includes('Added')) {
    isSuccess = true;
    const parts = message.match(/Added (\d+) (.+) of (.+) to your cart/);
    if (parts && parts.length >= 4) {
      const [_, quantity, unit, productName] = parts;
      messageContent = (
        <>
          <span className="success-icon">✓</span>
          <div className="notification-product">
            <strong>{quantity} {unit}</strong> of<br />
            <span className="product-name">{productName}</span><br />
            added to your cart!
          </div>
        </>
      );
    } else {
      messageContent = message;
    }
  } else if (message && (
    message.includes('Order placed successfully') || 
    message.includes('Thank you for your purchase')
  )) {
    isSuccess = true;
    isOrderConfirmation = true;
    messageContent = (
      <>
        <span className="success-icon">✓</span>
        <div className="notification-product">
          <span className="product-name">Order Confirmed!</span><br />
          Thank you for your purchase.
        </div>
      </>
    );
  } else if (message && (
    message.includes('failed') || 
    message.includes('error') || 
    message.includes('invalid') || 
    message.includes('Unable to') ||
    message.includes('expired')
  )) {
    isError = true;
    messageContent = (
      <>
        <span className="error-icon">⚠️</span>
        <div className="notification-error">
          {message}
        </div>
      </>
    );
  } else {
    messageContent = message || '';
  }

  // Simple render with minimal DOM
  return (
    <div 
      className={`notification-overlay ${visible ? 'show' : 'hide'}`}
      onClick={handleClose} // Close when clicking the overlay
    >
      <div 
        className={`notification-dialog ${isSuccess ? 'success' : ''} ${isError ? 'error' : ''}`}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the dialog
      >
        <div className="notification-title">
          {isError ? 'Error' : isOrderConfirmation ? 'Order Confirmation' : 'Shopping Cart Update'}
        </div>
        <div className="notification-message">
          {messageContent}
        </div>
        <div className="notification-actions">
          <button 
            className="notification-button" 
            onClick={
              isOrderConfirmation ? handleViewOrders : 
              isSuccess && !isOrderConfirmation ? handleViewCart : 
              handleClose
            }
          >
            {isOrderConfirmation ? 'View Orders' : 
             isSuccess && !isOrderConfirmation ? 'View Cart' : 
             'OK'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notification; 