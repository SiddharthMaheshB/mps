import React from 'react';
import './CustomNotification.css';
import { FaCheck, FaQuestion } from 'react-icons/fa';

const CustomNotification = ({ isVisible, message, actionText, onActionClick, header = "Profile Update", isConfirmation = false }) => {
  if (!isVisible) return null;

  return (
    <div className="notification-overlay">
      <div className="notification-card">
        <div className="notification-header">{header}</div>
        <div className="notification-checkmark">
          {isConfirmation ? <FaQuestion size={40} /> : <FaCheck size={40} />}
        </div>
        <div className="notification-message">
          {typeof message === 'string' ? message : message}
        </div>
        {actionText && (
          <button className="notification-action" onClick={onActionClick}>
            {actionText}
          </button>
        )}
      </div>
    </div>
  );
};

export default CustomNotification; 