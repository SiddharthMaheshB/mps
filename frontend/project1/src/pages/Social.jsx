import { Outlet, Link } from "react-router-dom";
import { useState } from "react";
import "./Social.css";
import NotificationBell from "./Social/Notification";
import { Newspaper, MessageCircle, User } from "lucide-react";
import { FaHome, FaRocket, FaUser } from "react-icons/fa";
export default function SocialLayout({login}) {
    // Centralized state for notifications
    if(!login){
        return (<>404 Not found!!</>);
    }
    const [newSharedPosts, setNewSharedPosts] = useState([
        {
            id: 101,
            username: "AgriExpert",
            userImage: "/user1.jpg",
            image: "/farm1.jpg",
            caption: "Got this shared by a friend! 🌾",
            likes: 12,
        },
    ]);

    // Function to clear notifications when viewing shared posts
    const clearNotifications = () => {
        setNewSharedPosts([]); // Reset notifications
    };

    return (
        <div className="social-layout">
            {/* Navbar */}
            <nav className="social-navbar">
                <h1>FarmConnect</h1>
                <div className="nav-links">
                    <Link to="/social"><FaHome size={24}/></Link>
                    <Link to="/social/shared"><MessageCircle size={24} /></Link>
                    <Link to="/social/profile/john_doe"><FaUser  size={24}/></Link>
                    
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
                    <Outlet context={{ newSharedPosts, clearNotifications }} />
                </main>
            </div>
        </div>
    );
}
