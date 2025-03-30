import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Notification.css";

const NotificationBell = ({ newSharedPosts, clearNotifications }) => {
    const [showNotification, setShowNotification] = useState(false);

    useEffect(() => {
        setShowNotification(newSharedPosts.length > 0);
    }, [newSharedPosts]);

    return (
        <div className="notification-container">
            <Link to="/social/shared" className="notification-icon" onClick={clearNotifications}>
                🔔
                {showNotification && <span className="notification-badge">{newSharedPosts.length}</span>}
            </Link>
        </div>
    );
};

export default NotificationBell;
