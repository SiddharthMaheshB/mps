import { Outlet, Link } from "react-router-dom";
import { useState } from "react";
import "./Social.css";
import NotificationBell from "./Social/Notification";

export default function SocialLayout() {
    // Centralized state for notifications
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
                    <Link to="/social">Feed</Link>
                    <Link to="/social/shared">Shared</Link>
                    <Link to="/social/profile">Profile</Link>
                    
                </div>
            </nav>

            {/* Main Content */}
            <div className="social-content">
                {/* Sidebar */}
                <aside className="social-sidebar">
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
