import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./Profile.css";

export default function SocialProfile() {
    const { username } = useParams(); 
    const [user, setUser] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
       
        setTimeout(() => {
            const users = [
                {
                    name: "John Doe",
                    username: "john_doe",
                    profilePic: "/1.png",
                    bio: "Organic farming enthusiast 🌱 | Smart Irrigation 💧",
                    farmLocation: "Punjab, India",
                    followers: 102,
                    following: 78,
                    posts: [{ id: 1, image: "/5.jpg", caption: "Fresh harvest today! 🌾" }]
                },
                {
                    name: "GreenFarmer",
                    username: "GreenFarmer",
                    profilePic: "/3.jpg",
                    bio: "Sustainable farming advocate 🌍",
                    farmLocation: "Kerala, India",
                    followers: 250,
                    following: 130,
                    posts: [{ id: 2, image: "/4.jpg", caption: "Look at this fresh harvest! 🍃" }]
                }
            ];

            const foundUser = users.find((u) => u.username === username);
            setUser(foundUser || null);
            setLoading(false);
        }, 1000); // Simulating a delay
    }, [username]);

    const toggleFollow = () => {
        setIsFollowing(!isFollowing);
    };

    if (loading) return <p>Loading profile...</p>;
    if (!user) return <p>User not found</p>;

    return (
        <div className="social-profile-container">
            <div className="social-profile-header">
                <img src={user.profilePic} alt="Profile" className="social-profile-pic" />
                <div className="social-profile-info">
                    <h2>{user.name}</h2>
                    <p>@{user.username}</p>
                    <p>{user.bio}</p>
                    <p>🌍 {user.farmLocation}</p>
                    <p>👥 {user.followers} followers | {user.following} following</p>
                    <button className={isFollowing ? "unfollow-btn" : "follow-btn"} onClick={toggleFollow}>
                        {isFollowing ? "Unfollow" : "Follow"}
                    </button>
                </div>
            </div>

            <div className="Social-profile-posts">
                {user.posts.length > 0 ? (
                    user.posts.map((post) => (
                        <div key={post.id} className="social-post-card">
                            <img src={post.image} alt="Post" />
                            <p>{post.caption}</p>
                        </div>
                    ))
                ) : (
                    <p>No posts yet</p>
                )}
            </div>
        </div>
    );
}
