import React, { useState } from "react";
import { motion } from "framer-motion";
import "./Profile.css"; // Import the CSS file

export default function Profile({ login, user }) {
  const [activeTab, setActiveTab] = useState("Overview");

  if (!login) {
    return <p className="not-found">404 Not Found!!</p>;
  }

  return (
    <div className="profile-container">
      {/* Sidebar */}
      <div className="sidebar">
        <button onClick={() => setActiveTab("Overview")}>Overview</button>
        <button onClick={() => setActiveTab("Orders")}>Orders</button>
        {user.role === "Farmer" && (
          <button onClick={() => setActiveTab("Listings")}>Listings</button>
        )}
        <button onClick={() => setActiveTab("Settings")}>Settings</button>
      </div>

      {/* Main Content */}
      <motion.div
        className="main-content"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
      >
        {/* Profile Info */}
        <div className="profile-info">
          <img src={user.avatar} alt={user.name} className="profile-avatar" />
          <h2 className="profile-name">{user.name}</h2>
          <p className="profile-role">{user.role}</p>
        </div>

        {/* Tabs Content */}
        <div className="tab-content">
          {activeTab === "Overview" && (
            <p>
              {user.role === "Farmer"
                ? "Your farm insights and recent activity..."
                : "Your recent purchases and interactions..."}
            </p>
          )}
          {activeTab === "Orders" && (
            <p>
              {user.role === "Farmer"
                ? "Orders from customers for your farm produce..."
                : "Your order history and delivery details..."}
            </p>
          )}
          {user.role === "Farmer" && activeTab === "Listings" && (
            <p>Manage and update your farm produce listings...</p>
          )}
          {activeTab === "Settings" && <p>Update your profile settings...</p>}
        </div>
      </motion.div>
    </div>
  );
}
