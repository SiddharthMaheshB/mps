import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Social.css";
import NotificationBell from "./Social/Notification";
import { Newspaper, MessageCircle, User } from "lucide-react";
import { FaHome, FaRocket, FaUser } from "react-icons/fa";

export default function SocialLayout({login}) {
    // Check for login
    if(!login){
        return (<>404 Not found!!</>);
    }
    
    const [newSharedPosts, setNewSharedPosts] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Get current user from localStorage on component mount
    useEffect(() => {
        try {
            const userJson = localStorage.getItem('user');
            if (userJson) {
                const user = JSON.parse(userJson);
                setCurrentUser(user);
            } else {
                // If user data isn't in localStorage but we have a token,
                // create a basic user object instead of redirecting
                const token = localStorage.getItem('token');
                const userId = localStorage.getItem('userId');
                if (token && userId) {
                    console.log("No user data in localStorage, using basic user data");
                    setCurrentUser({
                        _id: userId,
                        username: "User",
                        avatar: "/1.png"
                    });
                }
            }
        } catch (error) {
            console.error("Error parsing user data from localStorage:", error);
        }
    }, []);

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
                    <Outlet context={{ newSharedPosts, clearNotifications, currentUser }} />
                </main>
            </div>
        </div>
    );
}
