import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Social.css";
import NotificationBell from "./Social/Notification";
import { Newspaper, MessageCircle, User } from "lucide-react";
import { FaHome, FaRocket, FaUser } from "react-icons/fa";
import axios from "axios";

export default function SocialLayout({login}) {
    // Check for login
    if(!login){
        return (<>404 Not found!!</>);
    }
    
    const [newSharedPosts, setNewSharedPosts] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    // Fetch current user data from API on mount and when login state changes
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                
                if (!token) {
                    console.error("No authentication token found");
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
                        email: userResponse.data.email,
                        name: userResponse.data.username,
                        avatar: userResponse.data.avatar || "/1.png",
                        mobile: userResponse.data.mobile || "",
                        role: userResponse.data.role || "Farmer"
                    };
                    
                    // Update state and localStorage
                    setCurrentUser(userData);
                    localStorage.setItem('user', JSON.stringify(userData));
                    console.log("Updated user data from API:", userData);
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                
                // Fallback to localStorage if API call fails
                try {
                    const userJson = localStorage.getItem('user');
                    if (userJson) {
                        const user = JSON.parse(userJson);
                        setCurrentUser(user);
                        console.log("Using cached user data:", user);
                    }
                } catch (parseError) {
                    console.error("Error parsing user data from localStorage:", parseError);
                }
            } finally {
                setLoading(false);
            }
        };
        
        if (login) {
            fetchUserData();
        }
    }, [login]);

    // Function to clear notifications when viewing shared posts
    const clearNotifications = () => {
        setNewSharedPosts([]); // Reset notifications
    };

    // Check if a specific navigation item is active
    const isActive = (path) => {
        return location.pathname.startsWith(path);
    };

    return (
        <div className="social-layout">
            {/* Navbar */}
            <nav className="social-navbar">
                <h1>FarmConnect</h1>
                <div className="nav-links">
                    <Link to="/social" className={isActive('/social') && !isActive('/social/shared') && !isActive('/social/profile') ? 'active' : ''}>
                        <FaHome size={24}/>
                    </Link>
                    <Link to="/social/shared" onClick={clearNotifications} className={isActive('/social/shared') ? 'active' : ''}>
                        <MessageCircle size={24} />
                    </Link>
                    <Link to="/social/profile/me" className={isActive('/social/profile') ? 'active' : ''}>
                        <FaUser size={24}/>
                    </Link>
                </div>
            </nav>

            {/* Main Content */}
            <div className="social-content">
                {/* Sidebar */}
                <aside className="social-sidebar">
                    <Link to="/social/new-post" className="btn-green">
                        + Create Post
                    </Link>
                    
                    <h3>Trending</h3>
                    <p>#OrganicFarming</p>
                    <p>#SmartIrrigation</p>
                    <p>#AgriTech</p>
                </aside>

                {/* Page Content */}
                <main className="social-main">
                    <Outlet context={{ newSharedPosts, clearNotifications, currentUser, loading }} />
                </main>
            </div>
        </div>
    );
}
