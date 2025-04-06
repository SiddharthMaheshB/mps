import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaEdit } from "react-icons/fa"; 
import axios from "axios";
import "./Profile.css"; // Import the CSS file

export default function Profile({ login, setLogin, user, setUser }) {
  const [activeTab, setActiveTab] = useState("Overview");
  const [editMode, setEditMode] = useState(false);
  const [editedUser, setEditedUser] = useState(user || {});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [updateError, setUpdateError] = useState(""); // New state for profile update errors
  const navigate = useNavigate();
  
  // Fetch user profile data from backend if needed
  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("token");
      if (token && !user?.name) {
        try {
          setLoading(true);
          const config = {
            headers: {
              Authorization: `Bearer ${token}`
            }
          };
          const { data } = await axios.get("http://localhost:5000/api/auth/profile", config);
          
          const updatedUser = {
            name: data.username,
            username: data.username,
            email: data.email,
            mobile: data.mobile || "",
            _id: data._id,
            role: "Farmer", // Default role
            avatar: data.avatar || "/1.png"
          };
          
          // Update user in localStorage
          localStorage.setItem('user', JSON.stringify(updatedUser));
          
          setUser(updatedUser);
          setEditedUser(updatedUser);
          
        } catch (error) {
          setError("Failed to fetch profile data");
          // If token is invalid, logout
          if (error.response?.status === 401) {
            handleLogout();
          }
        } finally {
          setLoading(false);
        }
      } else if (user) {
        setEditedUser(user);
      }
    };
    
    if (login) {
      fetchUserProfile();
    }
  }, [login, user, setUser]);

  if (!login) {
    // Redirect to login if not logged in
    navigate("/login");
    return null;
  }

  const handleChange = (e) => {
    setEditedUser({...editedUser, [e.target.name]: e.target.value});
  };

  const toggleEdit = () => {
    if (editMode) {
      updateUserProfile();
    } else {
      setUpdateError(""); // Clear any previous errors when entering edit mode
      setEditMode(true);
    }
  };
  
  const updateUserProfile = async () => {
    try {
      setUpdateError(""); // Clear any previous errors
      setLoading(true);
      
      // Get the auth token
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Set up request configuration with authorization header
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      // Send the update request to the backend
      const response = await axios.put(
        "http://localhost:5000/api/auth/profile/update", 
        editedUser, 
        config
      );

      if (response.data.success) {
        // If successful, update local state
        setUser(editedUser);
        
        // Update user in localStorage
        localStorage.setItem('user', JSON.stringify(editedUser));
        
        // Exit edit mode
        setEditMode(false);
        
        // Show success message
        alert("Profile updated successfully!");
      } else {
        throw new Error(response.data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      setUpdateError(error.response?.data?.message || "Failed to update profile. Please try again.");
      // Don't exit edit mode to allow user to fix the error
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedUser({ ...editedUser, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleLogout = async () => {
    try {
      // Call logout API (optional, depends on your backend)
      const token = localStorage.getItem("token");
      if (token) {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        await axios.post("http://localhost:5000/api/auth/logout", {}, config);
      }
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      // Clear local storage
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("user");
      
      // Update state
      setLogin(false);
      setUser(null);
      
      // Redirect to home
      navigate("/");
    }
  };

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!editedUser) return <p>No user data available</p>;

  return (
    <div className="profile-container">
      {/* Sidebar */}
      <div className="sidebar">
        <button onClick={() => setActiveTab("Overview")}>Overview</button>
        <button onClick={() => setActiveTab("Orders")}>Orders</button>
        {editedUser.role === "Farmer" && (
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
          {/* Add error message display */}
          {updateError && <div className="error-message">{updateError}</div>}
          <div className="profile-avatar-container">
            <img 
              src={editedUser.avatar || "/1.png"} 
              alt={editedUser.name} 
              className="profile-avatar" 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/1.png";
              }}
            />
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

          <FaEdit className="edit-icon1" onClick={toggleEdit} />
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
            {editMode && (<><button onClick={toggleEdit} className="edit-input">Update</button></>)}
          </div>
        </div>

        {/* Tabs Content */}
        <div className="tab-content">
          {activeTab === "Overview" && (
            <p>
              {editedUser.role === "Farmer"
                ? "Your farm insights and recent activity..."
                : "Your recent purchases and interactions..."}
            </p>
          )}
          {activeTab === "Orders" && (
            <p>
              {editedUser.role === "Farmer"
                ? "Orders from customers for your farm produce..."
                : "Your order history and delivery details..."}
            </p>
          )}
          {editedUser.role === "Farmer" && activeTab === "Listings" && (
            <p>Manage and update your farm produce listings...</p>
          )}
          {activeTab === "Settings" && <p>Update your profile settings...</p>}
        </div>
      </motion.div>
    </div>
  );
}
