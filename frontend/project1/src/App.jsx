import { useState, useEffect } from 'react'
import {BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate} from 'react-router-dom'
import Layout from "./pages/Layout.jsx"
import Home from "./pages/Home.jsx"
import Login from './pages/login.jsx'
import Register from './pages/Register.jsx'
import Box2 from './pages/Box2.jsx'
import Notfound from './pages/Notfound.jsx'
import "./pages/styles.css"
import FarmScene from './pages/Social/Feed.jsx'
import Profile from './pages/Profile.jsx'
import Shop from './pages/Shop.jsx'
import FCLayout from './pages/FCLayout.jsx'
import Pest from './pages/farmercorner/Pest.jsx'
import Fertiliser from './pages/farmercorner/Fertiliser.jsx'
import Tutorials from './pages/farmercorner/Tutorials.jsx'
import FCIndex from './pages/farmercorner/FCIndex.jsx'
import CropRecommendation from './pages/farmercorner/CropRecommendation.jsx'
import defaultAvatar from "./frontimages/onlyplant.jpg"
import Shared from './pages/Social/Shared.jsx'
import SocialLayout from "./pages/Social.jsx";
import ProductDetail from './pages/ProductDetail.jsx'
import EcommerceLayout from './pages/EcommerceLayout.jsx'
import Cart from './pages/Cart.jsx'
import SocialProfile from './pages/Social/Profile.jsx'
import NewSocialPost from './pages/Social/NewPost.jsx'

import PostView from './pages/Social/PostView.jsx'

import SearchResults from './pages/SearchResults.jsx'
import { ShopProvider } from './context/ShopContext'
import OrderHistory from './pages/OrderHistory'

// function App(props) {
//  const loginb = true;
//  const user = {
//   name: "John Doe",
//   avatar: img, // Replace with an actual image URL
//   role: "Farmer", // Can be "Farmer" or any other role
//   mobile:"1234567890",
//   email:"johndoe@gmail.com"
// };
// >>>>>>> upstream/main

// Helper component to handle Google OAuth redirect
function GoogleCallbackHandler() {
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const handleGoogleCallback = () => {
      // Parse URL parameters
      const params = new URLSearchParams(location.search);
      const token = params.get('token');
      const userId = params.get('userId');
      const errorMessage = params.get('error');
      
      if (errorMessage) {
        // Handle error case
        console.error("Google OAuth Error:", decodeURIComponent(errorMessage));
        setError(decodeURIComponent(errorMessage));
        setLoading(false);
        return;
      }
      
      if (token && userId) {
        // Store token and user info
        localStorage.setItem('token', token);
        localStorage.setItem('userId', userId);
        
        // Create basic user data to prevent redirect issues
        const basicUserData = {
          _id: userId,
          username: "User",
          name: "User",
          email: "",
          mobile: "",
          role: "Farmer",
          avatar: "/1.png"
        };
        localStorage.setItem('user', JSON.stringify(basicUserData));
        
        // Redirect to home page instead of profile page
        navigate('/');
        
        // Reload to apply the changes
        window.location.reload();
      } else {
        setError("Authentication failed. Missing token or user ID.");
        setLoading(false);
      }
    };
    
    handleGoogleCallback();
  }, [location, navigate]);
  
  if (error) {
    return (
      <div style={{ 
        padding: "20px", 
        textAlign: "center", 
        maxWidth: "600px", 
        margin: "100px auto", 
        backgroundColor: "#f8d7da", 
        borderRadius: "5px",
        color: "#721c24" 
      }}>
        <h3>Authentication Error</h3>
        <p>{error}</p>
        <p>Please <a href="/login" style={{ color: "#721c24", fontWeight: "bold" }}>try again</a> or contact support.</p>
      </div>
    );
  }
  
  return (
    <div style={{ 
      padding: "20px", 
      textAlign: "center", 
      maxWidth: "600px", 
      margin: "100px auto" 
    }}>
      <h3>Processing Google login...</h3>
      {loading && <p>Please wait while we authenticate your account.</p>}
    </div>
  );
}

// Clear cart badge on startup
if (typeof window !== 'undefined' && window.localStorage) {
  const localCartString = window.localStorage.getItem('localCart');
  if (!localCartString || localCartString === '[]') {
    console.log('App: Empty cart on startup, ensuring cart data is clean');
    window.localStorage.setItem('localCart', '[]');
    setTimeout(() => {
      window.dispatchEvent(new Event('cartUpdated'));
    }, 200);
  }
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  // Check if user is logged in on app start
  useEffect(() => {
    const checkLoginStatus = () => {
      setIsCheckingAuth(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        // Clear any stale data if no token exists
        localStorage.removeItem('user');
        localStorage.removeItem('userId');
        setIsLoggedIn(false);
        setUser(null);
        setIsCheckingAuth(false);
        return;
      }
      
      // Token exists, check if it's valid by parsing it
      try {
        // Basic token validation by checking structure
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) {
          throw new Error('Invalid token format');
        }
        
        // Decode the payload (middle part)
        const payload = JSON.parse(atob(tokenParts[1]));
        
        // Check if token is expired
        const currentTime = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < currentTime) {
          console.log('Token expired, logging out');
          handleLogout();
          setIsCheckingAuth(false);
          return;
        }
        
        // Token appears valid
        setIsLoggedIn(true);
        
        // Get user data from localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
          try {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
          } catch (error) {
            console.error('Error parsing user data:', error);
            // Fall back to basic user
            setUser({
              _id: payload.id || '',
              name: "",
              email: "",
              mobile: "",
              role: "Farmer",
              avatar: "/1.png"
            });
          }
        } else {
          // Basic user info if no user data in localStorage
          setUser({
            _id: payload.id || '',
            name: "",
            email: "",
            mobile: "",
            role: "Farmer",
            avatar: "/1.png"
          });
        }
      } catch (error) {
        console.error('Error validating token:', error);
        handleLogout();
      }
      
      setIsCheckingAuth(false);
    };
    
    const handleLogout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userId');
      setIsLoggedIn(false);
      setUser(null);
      
      // Redirect to home page if not already there
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    };
    
    // Add event listener for session expiration
    window.addEventListener('session-expired', handleLogout);
    
    // Check login status
    checkLoginStatus();
    
    // Cleanup
    return () => {
      window.removeEventListener('session-expired', handleLogout);
    };
  }, []);
  
  // Global function to handle unauthorized responses
  const handleUnauthorized = () => {
    // First trigger the session-expired event
    const event = new Event('session-expired');
    window.dispatchEvent(event);
    
    // Then redirect to the home page
    if (window.location.pathname !== '/') {
      window.location.href = '/';
    }
  };
  
  // Attach to window for global access
  useEffect(() => {
    window.handleUnauthorized = handleUnauthorized;
    return () => {
      delete window.handleUnauthorized;
    };
  }, []);
  
  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column'
      }}>
        <div style={{ marginBottom: '20px' }}>Checking authentication...</div>
        <div 
          style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} 
        />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }
  
  return (
    <BrowserRouter>
      <ShopProvider>
      <Routes>
        <Route path="/" element={<Layout login={isLoggedIn} user={user} setLogin={setIsLoggedIn} setUser={setUser} />}>
          <Route index element={<Home login={isLoggedIn} />}/>
          
          <Route path="box" element={<Box2/>}/>
          <Route path="*" element={<Notfound/>}/>

          <Route path="/social" element={<SocialLayout login={isLoggedIn} />}>
            <Route index element={<FarmScene login={isLoggedIn}/>}/>
            <Route path="shared" element={<Shared login={isLoggedIn} />}/>
            <Route path="profile" element={<Navigate to="/social/profile/me" replace />} />
            <Route path="profile/:username" element={<SocialProfile />} />
            <Route path='new-post' element={<NewSocialPost/>}/>
          </Route>

          <Route path="/post/:postId" element={<PostView />} />

          <Route 
            path="profile" 
            element={
              isLoggedIn ? (
                <Profile 
                  login={isLoggedIn} 
                  setLogin={setIsLoggedIn} 
                  user={user} 
                  setUser={setUser}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
    <Route path="shop" element={<EcommerceLayout login={isLoggedIn} />}>
      <Route index element={<Shop login={isLoggedIn} />} />
      <Route path="product/:productId" element={<ProductDetail />} />
      <Route path="cart" element={<Cart />} />
      <Route path="search" element={<SearchResults />} />
      <Route path="order-history" element={<OrderHistory />} />
    </Route>

          {/* <Route path="shop" element={<EcommerceLayout login={isLoggedIn} />}>
            <Route index element={<Shop login={isLoggedIn} />} />
            <Route path=":productId" element={<ProductDetail />} />
            <Route path="cart" element={<Cart />} />
          </Route> */}

          <Route path="/farmercorner" element={<FCLayout login={isLoggedIn}/>}>
            <Route index element={<FCIndex login={isLoggedIn}/>}/>
            <Route path="pest-disease-detection" element={<Pest login={isLoggedIn}/>}/>
            <Route path="fertilizer-recommendation" element={<Fertiliser login={isLoggedIn}/>}/>
            <Route path="organic-farming-tutorials" element={<Tutorials login={isLoggedIn}/>}/>
            <Route path="crop-recommendation" element={<CropRecommendation login={isLoggedIn} />}/>
          </Route>
        </Route>

        {/* Google OAuth callback route */}
        <Route path="/oauth/callback" element={<GoogleCallbackHandler />} />

        <Route 
          path="login" 
          element={
            isLoggedIn ? 
            <Navigate to="/" replace /> : 
            <Login login={isLoggedIn} setLogin={setIsLoggedIn} setUser={setUser} />
          }
        />
        
        <Route 
          path="register" 
          element={
            isLoggedIn ? 
            <Navigate to="/" replace /> : 
            <Register login={isLoggedIn} setLogin={setIsLoggedIn} setUser={setUser} />
          }
        />
      </Routes>
      </ShopProvider>
    </BrowserRouter>
  )
}

export default App
