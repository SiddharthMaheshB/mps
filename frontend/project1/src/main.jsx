import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import App from './App.jsx'

// Configure global axios interceptors for authentication
axios.interceptors.response.use(
  response => response,
  error => {
    // Handle authentication errors globally
    if (error.response && error.response.status === 401) {
      console.error('Authentication error:', error.response.data);
      
      // Trigger session expiry event if window.handleUnauthorized exists
      if (window.handleUnauthorized) {
        window.handleUnauthorized();
      } else {
        // Fallback if event handler isn't set up yet
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userId');
        
        // Redirect to home page instead of login page
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

createRoot(document.getElementById('root')).render(
    <App/>
)
