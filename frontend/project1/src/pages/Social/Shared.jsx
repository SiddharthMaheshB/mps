import { useOutletContext } from "react-router-dom";
import React, { useState, useEffect } from "react";
import PostCard from "./PostCard";

export default function Shared() {
    const { newSharedPosts, clearNotifications } = useOutletContext();
    const [sharedPosts, setSharedPosts] = useState([]);

    useEffect(() => {
        // Mock shared posts with sharer info
        setSharedPosts([
            {
                id: 101,
                originalUsername: "AgriExpert",
                sharedBy: "JohnDoe",
                userImage: "/user1.jpg",
                image: "/farm1.jpg",
                caption: "Got this shared by a friend! 🌾",
                likes: 12,
            },
            {
                id: 102,
                originalUsername: "EcoFarmer",
                sharedBy: "GreenGuru",
                userImage: "/user2.jpg",
                image: "/harvest.jpg",
                caption: "Look at this fresh harvest! Shared by a friend 🍃",
                likes: 22,
            },
        ]);
    }, []);

    // Clears notifications when visiting this page
    useEffect(() => {
        clearNotifications();
    }, []);

    return (
        <div className="shared-page">
            <h2>Shared Posts</h2>
            {newSharedPosts.length === 0 ? (
                <>
                    {sharedPosts.length > 0 ? (
                        sharedPosts.map((post) => (
                            <div key={post.id} className="post-card">
                                <h3>Originally by: {post.originalUsername}</h3>
                                <p>Shared by: {post.sharedBy}</p>
                                <img src={post.image} alt="Shared" />
                                <p>{post.caption}</p>
                                <span>❤️ {post.likes} likes</span>
                            </div>
                        ))
                    ) : (
                        <p>No shared posts yet. Ask your friends to share something with you!</p>
                    )}
                </>
            ) : (
                newSharedPosts.map((post) => (
                    <div key={post.id} className="post-card">
                        <h3>Originally by: {post.originalUsername}</h3>
                        <p>Shared by: {post.sharedBy}</p>
                        <img src={post.image} alt="Shared" />
                        <p>{post.caption}</p>
                        <span>❤️ {post.likes} likes</span>
                    </div>
                ))
            )}
        </div>
    );
}
