import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaEdit, FaBox, FaShoppingBag, FaCalendarAlt, FaHome, FaList, FaCog, FaUser, FaShoppingCart, FaHeart, FaSeedling, FaPhone, FaShoppingBasket, FaUsers } from "react-icons/fa"; 
import axios from "axios";
import "./Profile.css"; // Import the CSS file
import { useShop } from "../context/ShopContext";

// Loading Skeleton components
const OrderCardSkeleton = () => (
  <div className="order-card skeleton">
    <div className="order-header skeleton-line"></div>
    <div className="order-items">
      <div className="skeleton-line"></div>
      <div className="skeleton-line"></div>
    </div>
    <div className="order-details">
      <div className="skeleton-line"></div>
      <div className="skeleton-line"></div>
      <div className="skeleton-line"></div>
    </div>
  </div>
);

const StatCardSkeleton = () => (
  <div className="stat-card skeleton">
    <div className="skeleton-circle"></div>
    <div className="stat-info">
      <div className="skeleton-line"></div>
      <div className="skeleton-line"></div>
    </div>
  </div>
);

export default function Profile({ login, setLogin, user, setUser }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [editName, setEditName] = useState(false);
  const [editMobile, setEditMobile] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [mobile, setMobile] = useState(user?.mobile || "");
  const [address, setAddress] = useState(user?.address || "");
  const [state, setState] = useState(user?.state || "");
  const [country, setCountry] = useState(user?.country || "");
  const [updateError, setUpdateError] = useState("");
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [loading, setLoading] = useState(true);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const navigate = useNavigate();
  
  // Get the shop context
  const { fetchOrders: fetchShopOrders, hardReset } = useShop();
  
  // Create a ref for the file input
  const fileInputRef = React.useRef(null);
  
  // Add state variables for password management
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  
  // Add state for contributions management
  const [contributions, setContributions] = useState([]);
  const [contributionsLoading, setContributionsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newContribution, setNewContribution] = useState({
    productName: '',
    quantity: '',
    unit: 'kg',
    description: '',
    price: ''
  });
  const [contributionError, setContributionError] = useState('');
  
  // Fetch fresh user data when component mounts or login state changes
  useEffect(() => {
    // Check for valid token and redirect if not authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      console.log("No token found, redirecting to home");
      setLogin(false);
      navigate('/');
      return;
    }
    
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error("No authentication token found");
          setLogin(false);
          navigate('/');
          return;
        }
        
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        
        // Fetch user profile from API
        const userResponse = await axios.get("http://localhost:5000/api/auth/profile", config);
        
        if (userResponse.data) {
          // Format user data
          const userData = {
            _id: userResponse.data._id,
            username: userResponse.data.username,
            name: userResponse.data.username, // Use username as display name
            email: userResponse.data.email,
            avatar: userResponse.data.avatar || "/1.png",
            mobile: userResponse.data.mobile || "",
            role: "Farmer", // Set role to Farmer for all users to enable contributions
            // Extract address fields
            address: userResponse.data.address || "",
            state: userResponse.data.state || "",
            country: userResponse.data.country || ""
          };
          
          // Update state and localStorage
          setUser(userData);
          setName(userData.name);
          setMobile(userData.mobile || "");
          setAddress(userData.address || "");
          setState(userData.state || "");
          setCountry(userData.country || "");
          localStorage.setItem('user', JSON.stringify(userData));
          console.log("Updated user data from API:", userData);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        
        if (error.response && error.response.status === 401) {
          console.log("Unauthorized access, redirecting to home");
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('userId');
          setLogin(false);
          navigate('/');
          return;
        }
        
        // Fallback to localStorage if API call fails
        try {
          const userJson = localStorage.getItem('user');
          if (userJson) {
            const cachedUser = JSON.parse(userJson);
            setUser(cachedUser);
            setName(cachedUser.name);
            setMobile(cachedUser.mobile || "");
            setAddress(cachedUser.address || "");
            setState(cachedUser.state || "");
            setCountry(cachedUser.country || "");
            console.log("Using cached user data:", cachedUser);
          }
        } catch (parseError) {
          console.error("Error parsing user data from localStorage:", parseError);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
    fetchUserOrders();
    fetchSocialStats();
  }, [login, navigate, setUser]);
  
  // Add a separate useEffect to listen for order updates
  useEffect(() => {
    // Listen for 'orderUpdated' event (dispatched when orders change)
    const handleOrderUpdate = () => {
      console.log('Order update detected, refreshing orders in Profile');
      fetchUserOrders();
    };
    
    // Add event listener
    window.addEventListener('orderUpdated', handleOrderUpdate);
    
    // Clean up listener on component unmount
    return () => {
      window.removeEventListener('orderUpdated', handleOrderUpdate);
    };
  }, []);
  
  // Create userInfo object based on user prop
  const userInfo = user || { 
    name: "", 
    email: "", 
    mobile: "", 
    role: "Customer",
    address: "",
    state: "",
    country: ""
  };
  
  // Fetch user orders from context or API
  const fetchUserOrders = async () => {
    setOrdersLoading(true);
    try {
      // Get current user ID
      const currentUserId = localStorage.getItem('userId');
      if (!currentUserId) {
        console.error('No userId found when fetching orders in Profile');
        setOrders([]);
        setOrdersLoading(false);
        return;
      }
      
      // Use the fetchOrders function from ShopContext
      const shopOrders = await fetchShopOrders();
      
      // If ShopContext returned orders, use them
      if (shopOrders && Array.isArray(shopOrders)) {
        // Filter orders for the current user only
        const userOrders = shopOrders.filter(order => 
          order.userId === currentUserId
        );
        
        // Sort orders by date (newest first)
        const sortedOrders = userOrders.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        // Store all orders but we'll only display the most recent ones
        setOrders(sortedOrders);
        console.log(`Fetched and sorted ${sortedOrders.length} orders for user ${currentUserId}`);
      } else {
        // Fallback: try to get them directly from localStorage
        try {
          const storedOrders = localStorage.getItem('dummyOrders');
          if (storedOrders) {
            const parsedOrders = JSON.parse(storedOrders);
            if (Array.isArray(parsedOrders)) {
              // Filter orders by current user
              const userOrders = parsedOrders.filter(order => 
                order.userId === currentUserId
              );
              
              // Sort by date (newest first)
              const sortedOrders = userOrders.sort((a, b) => 
                new Date(b.createdAt) - new Date(a.createdAt)
              );
              
              setOrders(sortedOrders);
              console.log(`Using ${sortedOrders.length} localStorage orders for user ${currentUserId}`);
            }
          }
        } catch (err) {
          console.error('Error parsing orders from localStorage:', err);
          setOrders([]);
        }
      }
      
      // Set last fetch time
      localStorage.setItem('lastOrdersFetchTime', Date.now().toString());
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };
  
  // Fetch user social stats (followers and following)
  const fetchSocialStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      // Use the same endpoint as the social profile page
      try {
        // Get social profile data from the API - this is the same endpoint used by the social profile
        const socialResponse = await axios.get("http://localhost:5000/api/social/profile/me", config);
        
        if (socialResponse.data) {
          const socialData = socialResponse.data;
          console.log("Fetched social profile stats:", socialData);
          
          // Update the counts with actual values from the social API
          setFollowers(socialData.followers || 0);
          setFollowing(socialData.following || 0);
          
          // Store in localStorage as backup
          localStorage.setItem('userFollowers', socialData.followers?.toString() || '0');
          localStorage.setItem('userFollowing', socialData.following?.toString() || '0');
          return;
        }
      } catch (socialErr) {
        console.warn("Could not fetch social profile stats:", socialErr);
      }
      
      // Fall back to stored values if API fails
      const storedFollowers = localStorage.getItem('userFollowers');
      const storedFollowing = localStorage.getItem('userFollowing');
      
      if (storedFollowers && storedFollowing) {
        setFollowers(parseInt(storedFollowers));
        setFollowing(parseInt(storedFollowing));
      } else {
        // Use default values as last resort
        setFollowers(3); // Default value used in social profile
        setFollowing(3); // Default value used in social profile
        
        // Store these defaults
        localStorage.setItem('userFollowers', '3');
        localStorage.setItem('userFollowing', '3');
      }
    } catch (error) {
      console.error('Error fetching social stats:', error);
      // Set default values as in social profile if nothing is available
      setFollowers(3);
      setFollowing(3);
    }
  };
  
  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    
    // Fetch orders when switching to orders tab
    if (tab === 'orders') {
      const lastFetchTime = parseInt(localStorage.getItem('lastOrdersFetchTime') || '0');
      const thirtySecondsAgo = Date.now() - 30000;
      
      if (lastFetchTime < thirtySecondsAgo) {
        fetchUserOrders();
      }
    }
  };
  
  // Handle name update
  const handleNameUpdate = async () => {
    setEditName(false);
    
    try {
      // Get the auth token
      const token = localStorage.getItem('token');
      if (!token) {
        setUpdateError("Authentication required");
        return;
      }

      // Set up request configuration
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      // Prepare data to update
      const updateData = {
        name: name
      };
      
      // Send the update request to backend
      const response = await axios.put(
        "http://localhost:5000/api/auth/profile/update", 
        updateData,
        config
      );

      if (response.data && response.data.success) {
        // Update local state and localStorage
        const updatedUser = {...userInfo, name};
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        console.log("Updated user name:", name);
      }
    } catch (error) {
      console.error("Error updating name:", error);
      setUpdateError(error.response?.data?.message || "Failed to update name");
    }
  };
  
  // Handle mobile update
  const handleMobileUpdate = async () => {
    setEditMobile(false);
    
    try {
      // Get the auth token
      const token = localStorage.getItem('token');
      if (!token) {
        setUpdateError("Authentication required");
        return;
      }
      
      // Set up request configuration
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      // Prepare data to update
      const updateData = {
        mobile: mobile
      };
      
      // Send the update request to backend
      const response = await axios.put(
        "http://localhost:5000/api/auth/profile/update",
        updateData,
        config
      );
      
      if (response.data && response.data.success) {
        // Update local state and localStorage
        const updatedUser = {...userInfo, mobile};
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        console.log("Updated user mobile:", mobile);
      }
    } catch (error) {
      console.error("Error updating mobile:", error);
      setUpdateError(error.response?.data?.message || "Failed to update mobile number");
    }
  };
  
  // Load address fields from user data if available
  useEffect(() => {
    if (user) {
      setAddress(user.address || '');
      setState(user.state || '');
      setCountry(user.country || '');
    }
  }, [user]);
  
  // Handle profile update (for settings tab)
  const handleProfileUpdate = async () => {
    try {
      // Get the auth token
      const token = localStorage.getItem('token');
      if (!token) {
        setUpdateError("Authentication required");
        return;
      }
      
      // Set up request configuration
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      // Prepare data to update
      const updateData = {
        name: name,
        mobile: mobile,
        address: address,
        state: state,
        country: country
      };
      
      // Send the update request to backend
      const response = await axios.put(
        "http://localhost:5000/api/auth/profile/update",
        updateData,
        config
      );
      
      if (response.data && response.data.success) {
        // Update local state and localStorage
        const updatedUser = {...userInfo, name, mobile, address, state, country};
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        alert("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setUpdateError(error.response?.data?.message || "Failed to update profile");
    }
  };
  
  // Handle logout
  const handleLogout = async () => {
    try {
      // Get the auth token
      const token = localStorage.getItem('token');
      if (token) {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        
        // Call logout API
        await axios.post("http://localhost:5000/api/auth/logout", {}, config);
      }
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      // Clear local storage and state
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setLogin(false);
      setUser(null);
      
      // Redirect to home page instead of login page
      navigate('/');
    }
  };

  // Handle profile picture update
  const handleAvatarClick = () => {
    // Trigger the hidden file input click
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Handle file selection for profile picture
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file type and size
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!validTypes.includes(file.type)) {
      setUpdateError("Please upload a valid image file (JPEG, PNG, or GIF)");
      return;
    }
    
    if (file.size > maxSize) {
      setUpdateError("File is too large. Maximum size is 5MB");
      return;
    }
    
    try {
      setAvatarLoading(true);
      
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('avatar', file);
      
      // Get the auth token
      const token = localStorage.getItem('token');
      if (!token) {
        setUpdateError("Authentication required");
        return;
      }
      
      // Set up request configuration
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      };
      
      // Send the update request to backend
      const response = await axios.post(
        "http://localhost:5000/api/auth/profile/avatar",
        formData,
        config
      );
      
      if (response.data && response.data.success) {
        // Update local state and localStorage with new avatar
        const avatarUrl = response.data.avatarUrl || response.data.avatar;
        
        // Update user state with new avatar
        const updatedUser = {...userInfo, avatar: avatarUrl};
        setUser(updatedUser);
        
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser));
        console.log("Updated profile picture:", avatarUrl);
      }
    } catch (error) {
      console.error("Error updating profile picture:", error);
      setUpdateError(error.response?.data?.message || "Failed to update profile picture");
    } finally {
      setAvatarLoading(false);
    }
  };

  // Handle password update
  const handlePasswordUpdate = async () => {
    // Reset error state
    setPasswordError("");
    
    // Validate inputs
    if (!currentPassword) {
      setPasswordError("Current password is required");
      return;
    }
    
    if (!newPassword) {
      setPasswordError("New password is required");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
      return;
    }
    
    try {
      // Get the auth token
      const token = localStorage.getItem('token');
      if (!token) {
        setPasswordError("Authentication required");
        return;
      }
      
      // Set up request configuration
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      // Prepare data to update
      const updateData = {
        currentPassword: currentPassword,
        newPassword: newPassword
      };
      
      // Send the update request to backend
      const response = await axios.put(
        "http://localhost:5000/api/auth/profile/password",
        updateData,
        config
      );
      
      if (response.data && response.data.success) {
        // Clear input fields
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        
        // Show success message
        alert("Password updated successfully!");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      setPasswordError(error.response?.data?.message || "Failed to update password");
    }
  };

  // Fetch contributions when component mounts
  useEffect(() => {
    console.log("Checking for contributions, user:", userInfo);
    fetchContributions();
  }, [userInfo]); // Re-fetch when user info changes

  // Handle API errors that indicate session expiration
  const handleApiError = (error, errorMessage = "An error occurred") => {
    console.error(errorMessage, error);
    
    if (error.response && error.response.status === 401) {
      // Clear invalid session data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userId');
      
      // Show message and redirect
      alert("Your session has expired. Please log in again.");
      setLogin(false);
      navigate('/');
      return true;
    }
    return false;
  };

  // Fetch contributions from API
  const fetchContributions = async () => {
    console.log("Starting fetchContributions");
    setContributionsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error("No token found for fetching contributions");
        setContributions([]);
        setContributionsLoading(false);
        return;
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      console.log("Making API call to fetch contributions");
      console.log("API URL:", "http://localhost:5000/api/products");
      console.log("Headers:", JSON.stringify(config));
      
      // Get farmer contributions from API
      const response = await axios.get("http://localhost:5000/api/products", config);
      
      console.log("API Response for contributions:", response);
      
      if (response.data) {
        console.log("Setting contributions state with:", response.data);
        console.log("Number of contributions:", response.data.length);
        setContributions(response.data);
        console.log("Successfully set contributions:", response.data);
      } else {
        // If API returns no data, set empty array
        console.log("API returned no contributions data");
        setContributions([]);
      }
    } catch (error) {
      if (handleApiError(error, 'Error fetching contributions')) {
        return;
      }
      
      if (error.response) {
        console.error('API response error status:', error.response.status);
        console.error('API response error data:', error.response.data);
        
        if (error.response.status === 403) {
          setContributionError("You don't have permission to view these products");
        } else {
          setContributionError(error.response.data?.message || "Failed to load products");
        }
      } else if (error.request) {
        console.error('API request error (no response received):', error.request);
        setContributionError("Network error. The server is not responding. Please check your connection.");
      } else {
        console.error('Error setting up request:', error.message);
        setContributionError("Error preparing request: " + error.message);
      }
      
      // Use empty array if API call fails
      setContributions([]);
    } finally {
      setContributionsLoading(false);
    }
  };

  // Handle adding a new contribution
  const handleAddContribution = async () => {
    // Clear previous errors
    setContributionError('');
    console.log("Starting handleAddContribution");
    
    try {
      // Validate inputs
      if (!newContribution.productName || newContribution.productName.trim() === '') {
        setContributionError('Product name is required');
        return;
      }
      
      if (!newContribution.quantity || isNaN(parseFloat(newContribution.quantity)) || parseFloat(newContribution.quantity) <= 0) {
        setContributionError('Quantity must be a positive number');
        return;
      }
      
      if (!newContribution.price || isNaN(parseFloat(newContribution.price)) || parseFloat(newContribution.price) <= 0) {
        setContributionError('Price must be a positive number');
        return;
      }
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userId');
        setContributionError('Authentication required. Please log in again.');
        setTimeout(() => {
          setLogin(false);
          navigate('/');
        }, 1000);
        return;
      }
      
      // Set up request configuration
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      // Format data for the API
      const productData = {
        name: newContribution.productName.trim(),
        inventory: parseFloat(newContribution.quantity),
        unit: newContribution.unit,
        price: parseFloat(newContribution.price),
        description: (newContribution.description || '').trim()
      };
      
      console.log("Sending product data to API:", JSON.stringify(productData));
      console.log("API URL:", "http://localhost:5000/api/products");
      console.log("Headers:", JSON.stringify(config));
      
      // Send request to API
      const response = await axios.post(
        "http://localhost:5000/api/products",
        productData,
        config
      );
      
      console.log("API response for adding product:", response);
      
      if (response.data) {
        console.log("Contribution added successfully:", response.data);
        
        // Add the new contribution to the list
        const newProduct = response.data;
        setContributions(prevContributions => [...prevContributions, newProduct]);
        
        // Reset form
        setNewContribution({
          productName: '',
          quantity: '',
          unit: 'kg',
          description: '',
          price: ''
        });
        
        // Hide form
        setShowAddForm(false);
        
        // Show success message
        alert('Product successfully added!');
        
        // Refresh the contributions list
        setTimeout(() => {
          fetchContributions();
        }, 500);
      }
    } catch (error) {
      if (handleApiError(error, 'Error adding contribution')) {
        return;
      }
      
      let errorMessage = 'Failed to add product. Please try again.';
      
      if (error.response) {
        console.error('API response error status:', error.response.status);
        console.error('API response error data:', error.response.data);
        
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
        
        if (error.response.status === 400) {
          setContributionError(`Please check your product information. ${errorMessage}`);
        } else if (error.response.status === 403) {
          setContributionError('You do not have permission to add products.');
        } else {
          setContributionError(errorMessage);
        }
      } else if (error.request) {
        console.error('API request error (no response received):', error.request);
        setContributionError('Network error. The server is not responding. Please check your connection and try again.');
      } else {
        console.error('Error setting up request:', error.message);
        setContributionError(`Error preparing request: ${error.message}`);
      }
    }
  };

  // Handle removing a contribution
  const handleRemoveContribution = async (id) => {
    if (!confirm('Are you sure you want to remove this product?')) {
      return;
    }
    
    setContributionError(''); // Clear previous errors
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setContributionError('Authentication required. Please log in again.');
        setTimeout(() => {
          setLogin(false);
          navigate('/');
        }, 1000);
        return;
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      console.log(`Removing product with ID: ${id}`);
      
      // Send request to API
      const response = await axios.delete(`http://localhost:5000/api/products/${id}`, config);
      
      console.log('Delete response:', response.data);
      
      // Remove from state
      const updatedContributions = contributions.filter(item => item._id !== id);
      setContributions(updatedContributions);
      
      // Show success message
      alert('Product successfully removed');
      
      // Refresh contributions from the server
      fetchContributions();
    } catch (error) {
      if (handleApiError(error, 'Error removing contribution')) {
        return;
      }
      
      if (error.response) {
        console.error('API response error:', error.response.status, error.response.data);
        if (error.response.status === 404) {
          setContributionError('Product not found. It may have been already deleted.');
        } else if (error.response.status === 403) {
          setContributionError('You do not have permission to delete this product.');
        } else {
          setContributionError(error.response.data.message || 'Failed to remove product. Please try again.');
        }
      } else if (error.request) {
        console.error('API request error (no response received):', error.request);
        setContributionError('Network error. Please check your connection and try again.');
      } else {
        console.error('API setup error:', error.message);
        setContributionError('Something went wrong. Please try again.');
      }
    }
  };

  // Update form field values with proper type handling
  const handleContributionInputChange = (e) => {
    const { name, value, type } = e.target;
    
    // Handle different input types
    let processedValue = value;
    if (type === 'number') {
      // Ensure empty values are stored as empty strings, not 0
      processedValue = value === '' ? '' : value;
    }
    
    console.log(`Field ${name} changed to: ${processedValue}`);
    
    setNewContribution({
      ...newContribution,
      [name]: processedValue
    });
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
          alert("Order data has been completely reset");
        } else {
          alert("Failed to reset data. Please try again.");
        }
      }
    }
  };

  // Show loading state if loading
  if (loading) {
    return (
      <div className="profile-container">
        <div className="main-content" style={{ marginLeft: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <h2>Loading profile...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div style={{ paddingTop: "70px" }}> {/* Add padding to offset navbar */}
          <button
            className={`sidebar-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => handleTabChange('overview')}
          >
            <FaUser className="sidebar-icon" /> Overview
          </button>
          <button
            className={`sidebar-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => handleTabChange('orders')}
          >
            <FaShoppingCart className="sidebar-icon" /> Orders
          </button>
          {userInfo.role === 'Farmer' && (
            <button
              className={`sidebar-btn ${activeTab === 'contributions' ? 'active' : ''}`}
              onClick={() => handleTabChange('contributions')}
            >
              <FaSeedling className="sidebar-icon" /> Contributions
            </button>
          )}
          <button
            className={`sidebar-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => handleTabChange('settings')}
          >
            <FaCog className="sidebar-icon" /> Settings
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="profile-info">
          {updateError && <div className="error-message">{updateError}</div>}
          <div className="profile-avatar">
            {avatarLoading && (
              <div className="avatar-loading">
                <div className="spinner"></div>
              </div>
            )}
            <img
              src={userInfo.avatar || "https://via.placeholder.com/150"}
              alt="Profile"
              style={{ opacity: avatarLoading ? 0.5 : 1 }}
            />
            <div className="edit-avatar-icon" onClick={handleAvatarClick}>
              <FaEdit />
            </div>
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </div>
          <div className="profile-details">
            <div className="username-field">
              {editName ? (
              <input
                type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={handleNameUpdate}
                  autoFocus
                className="edit-input"
              />
              ) : (
                <>
                  <h2>{userInfo.name}</h2>
                  <div className="edit-field" onClick={() => setEditName(true)}>
                    <FaEdit className="edit-icon" />
                  </div>
                </>
            )}
          </div>
            
            <div className="mobile-field">
              <FaPhone className="phone-icon" />
              {editMobile ? (
              <input
                type="text"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  onBlur={handleMobileUpdate}
                  autoFocus
                className="edit-input"
              />
              ) : (
                <div className="mobile-wrapper" onClick={() => setEditMobile(true)}>
                  <span className="mobile-text">{userInfo.mobile || 'Add mobile number'}</span>
                  <FaEdit className="edit-icon" />
          </div>
            )}
          </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <h3>Account Overview</h3>
              <div className="stats-container">
                <div className="stat-card">
                  <div className="stat-icon"><FaShoppingCart /></div>
                  <div className="stat-content">
                    <h4>Orders</h4>
                    {ordersLoading ? (
                      <p>Loading...</p>
                    ) : (
                      <p>{orders ? orders.length : 0}</p>
                    )}
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon"><FaUsers /></div>
                  <div className="stat-content">
                    <h4>Followers</h4>
                    <p>{followers}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon"><FaUser /></div>
                  <div className="stat-content">
                    <h4>Following</h4>
                    <p>{following}</p>
                  </div>
                </div>
                {userInfo.role === 'Farmer' && (
                  <div className="stat-card">
                    <div className="stat-icon"><FaSeedling /></div>
                    <div className="stat-content">
                      <h4>Contributions</h4>
                      <p>{contributionsLoading ? 'Loading...' : contributions.length}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="orders-tab">
              <h3>Order History</h3>
              {ordersLoading ? (
                <p>Loading orders...</p>
              ) : orders && orders.length > 0 ? (
                <>
                  <div className="orders-list">
                    {orders.slice(0, 10).map(order => (
                      <div className="order-card detailed" key={order._id || order.id}>
                        <div className="order-summary">
                          <div className="order-header-info">
                            <h3 className="order-number">Order #{(order._id || order.id).includes('demo-order-') 
                              ? (order._id || order.id).substring((order._id || order.id).lastIndexOf('-') + 1).substring(0, 8)
                              : (order._id || order.id).substring(0, 8)}</h3>
                            <div className="order-date">
                              Placed on: {new Date(order.createdAt).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                              })} at {new Date(order.createdAt).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                            <div className="order-total">
                              <span className="total-label">Total: </span>
                              <span className="total-amount">₹{(order.totalAmount || order.total || 0).toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="order-items-container">
                          <h3 className="items-title">Items</h3>
                          <div className="order-items-table">
                            <div className="order-items-header">
                              <div className="col product-col">Product</div>
                              <div className="col quantity-col">Quantity</div>
                              <div className="col price-col">Price</div>
                              <div className="col subtotal-col">Subtotal</div>
                            </div>
                            
                            <div className="order-items-body">
                              {(order.items || order.cartItems || []).map(item => (
                                <div className="order-item-row" key={item._id || item.id || item.productId || item.name}>
                                  <div className="col product-col">
                                    <div className="product-name">{item.name || item.productName}</div>
                                    <div className="product-description">{item.description || ""}</div>
                                  </div>
                                  <div className="col quantity-col">{item.quantity} {item.unit || 'kg'}</div>
                                  <div className="col price-col">₹{(item.price || 0).toFixed(2)}</div>
                                  <div className="col subtotal-col">₹{((item.quantity || 0) * (item.price || 0)).toFixed(2)}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="order-separator"></div>
                      </div>
                    ))}
                  </div>
                  
                  {orders.length > 10 && (
                    <div className="more-orders-note">
                      Showing 10 most recent orders out of {orders.length} total orders
                    </div>
                  )}
                </>
              ) : (
                <div className="no-orders">
                  <FaShoppingBasket />
                  <p>You haven't placed any orders yet.</p>
                  <button className="shop-now-btn" onClick={() => navigate('/products')}>Shop Now</button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'contributions' && (
            <div className="contributions-tab">
              <h3>Your Contributions</h3>
              {contributionError && <div className="error-message">{contributionError}</div>}
              
              {contributionsLoading ? (
                <div className="loading-container">Loading contributions...</div>
              ) : (
                <>
                  {!showAddForm ? (
                    <button 
                      className="add-product-btn" 
                      onClick={() => setShowAddForm(true)}
                    >
                      Add New Product
                    </button>
                  ) : (
                    <div className="contribution-form">
                      <h4>Add New Product</h4>
                      <div className="form-group">
                        <label>Product Name</label>
                        <input 
                          type="text" 
                          name="productName"
                          value={newContribution.productName}
                          onChange={handleContributionInputChange}
                          placeholder="Enter product name"
                        />
                      </div>
                      
                      <div className="form-row">
                        <div className="form-group">
                          <label>Quantity</label>
                          <input 
                            type="number" 
                            name="quantity"
                            value={newContribution.quantity}
                            onChange={handleContributionInputChange}
                            placeholder="Enter quantity"
                            min="0.01"
                            step="0.01"
                          />
                        </div>
                        
                        <div className="form-group">
                          <label>Unit</label>
                          <select 
                            name="unit"
                            value={newContribution.unit}
                            onChange={handleContributionInputChange}
                          >
                            <option value="kg">Kilograms (kg)</option>
                            <option value="g">Grams (g)</option>
                            <option value="ton">Ton</option>
                            <option value="lb">Pounds (lb)</option>
                            <option value="l">Liters (l)</option>
                            <option value="ml">Milliliters (ml)</option>
                            <option value="pcs">Pieces (pcs)</option>
                          </select>
                        </div>
                        
                        <div className="form-group">
                          <label>Price (₹ per unit)</label>
                          <input 
                            type="number" 
                            name="price"
                            value={newContribution.price}
                            onChange={handleContributionInputChange}
                            placeholder="Enter price per unit"
                            min="0.01"
                            step="0.01"
                          />
                        </div>
                      </div>
                      
                      <div className="form-group">
                        <label>Description</label>
                        <textarea 
                          name="description"
                          value={newContribution.description}
                          onChange={handleContributionInputChange}
                          placeholder="Describe your product"
                          rows="3"
                        ></textarea>
                      </div>
                      
                      <div className="form-actions">
                        <button 
                          className="cancel-btn" 
                          onClick={() => setShowAddForm(false)}
                        >
                          Cancel
                        </button>
                        <button 
                          className="save-btn" 
                          data-action="add-contribution"
                          onClick={handleAddContribution}
                        >
                          Add Product
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {contributions.length > 0 ? (
                    <div className="contributions-list">
                      {contributions.map(contribution => (
                        <div className="contribution-card" key={contribution._id}>
                          <div className="contribution-header">
                            <h4>{contribution.name || contribution.productName}</h4>
                            <button 
                              className="remove-contribution" 
                              onClick={() => handleRemoveContribution(contribution._id)}
                            >
                              &times;
                            </button>
                          </div>
                          
                          <div className="contribution-details">
                            <div className="detail-row">
                              <span className="detail-label">Quantity:</span>
                              <span className="detail-value">{contribution.quantity || contribution.inventory} {contribution.unit}</span>
                            </div>
                            
                            <div className="detail-row">
                              <span className="detail-label">Price:</span>
                              <span className="detail-value">₹{contribution.price} per {contribution.unit}</span>
                            </div>
                            
                            {contribution.description && (
                              <div className="contribution-description">
                                <span className="detail-label">Description:</span>
                                <p>{contribution.description}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-contributions">
                      <FaSeedling />
                      <p>No contributions yet. Start adding your products!</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="settings-tab">
              <h3>Account Settings</h3>
              <div className="settings-card">
                <h4>Personal Information</h4>
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" value={userInfo.email} disabled />
                </div>
                <div className="form-group">
                  <label>Mobile Number</label>
                  <input type="text" value={mobile} onChange={(e) => setMobile(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input type="text" value={state} onChange={(e) => setState(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Country</label>
                  <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} />
                </div>
                <button className="save-btn" onClick={handleProfileUpdate}>Save Changes</button>
              </div>
              <div className="settings-card">
                <h4>Password</h4>
                {passwordError && <div className="error-message">{passwordError}</div>}
                <div className="form-group">
                  <label>Current Password</label>
                  <input 
                    type="password" 
                    value={currentPassword} 
                    onChange={(e) => setCurrentPassword(e.target.value)} 
                    placeholder="Enter your current password"
                  />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input 
                    type="password" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    placeholder="Enter your new password (min. 6 characters)"
                  />
                </div>
                <div className="form-group">
                  <label>Confirm Password</label>
                  <input 
                    type="password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your new password" 
                  />
                </div>
                <button className="save-btn" onClick={handlePasswordUpdate}>Update Password</button>
              </div>
              
              <div className="settings-card">
                <h4>Emergency Tools</h4>
                <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
                  Use these tools only if you're experiencing persistent issues with the application. 
                  The following actions affect data for all users and cannot be undone.
                </p>
                <button 
                  className="hard-reset-btn" 
                  onClick={handleHardReset}
                  style={{
                    background: '#d9534f',
                    color: 'white',
                    border: 'none',
                    padding: '10px 15px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginTop: '10px',
                    width: '100%',
                    fontWeight: 'bold'
                  }}
                >
                  Reset All Order Data
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
