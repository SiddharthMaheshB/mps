import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaEdit } from "react-icons/fa"; 
import "./Profile.css"; // Import the CSS file

export default function Profile({ login, user }) {
  const [activeTab, setActiveTab] = useState("Overview");
  const [editMode, seteditMode] = useState(false);
  const [editedUser,seteditedUser] = useState(user);

  if (!login) {
    return <p className="not-found">404 Not Found!!</p>;
  }

  const handleChange = (e)=>{
      seteditedUser({...editedUser,[e.target.name]:e.target.value})
  }

  const toggleedit = ()=>{
    seteditMode(!editMode)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        seteditedUser({ ...editedUser, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };
  

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
        <div className="profile-avatar-container">
  <img src={editedUser.avatar} alt={editedUser.name} className="profile-avatar" />
  <label htmlFor="file-input">
    <FaEdit className="edit-icon" />
  </label>
  <input
    type="file"
    id="file-input"
    accept="image/*"
    className="file-input"
    onChange={(e) => handleFileChange(e)}
  />
</div>

          <FaEdit className="edit-icon1" onClick={toggleedit} />
          <div className="profile-header">
         
            {editMode ? (
              <>
              <strong>Username: </strong>
              <input
                type="text"
                name="name"
                value={editedUser.name}
                onChange={handleChange}
                className="edit-input"
              />
              </>
            ) : (
              <h2 className="profile-name">{editedUser.name}</h2>
            )}
          </div>
          <p className="profile-role">{editedUser.role}</p>

          <div className="profile-field">
            
            {editMode ? (
              <>
              <strong>Mobile: </strong>
              <input
                type="text"
                name="mobile"
                value={editedUser.mobile}
                onChange={handleChange}
                className="edit-input"
              />
              </>
            ) : (
              <p className="profile-role"><strong>Mobile: </strong>{
              editedUser.mobile}
              </p>
            )}
          </div>
          <div className="profile-field">
           
            {editMode ? (
              <>
               <strong>Email: </strong>
              <input
                type="text"
                name="email"
                value={editedUser.email}
                onChange={handleChange}
                className="edit-input"
              />
              </>

            ) : (
              <p className="profile-role"><strong>Email: </strong>{editedUser.email}</p>
              
            )}
          </div>
          <div className="profile-field">
            {editMode && (<><button onClick={toggleedit} className="edit-input">Update</button></>)}
          </div>
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
