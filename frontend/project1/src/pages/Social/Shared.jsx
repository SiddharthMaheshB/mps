import React, { useState, useEffect } from "react";
import PostCard from "./PostCard";
import "./Feed.css";
import img1 from "/6.jpg";
import "./SharedPosts.css"
import { ArrowRight } from "lucide-react";

const getPosts = () => [
    {
        id: 1,
        username: "GreenFarmer",
        userImage: "/4.jpg",
        image: "/2.png",
        caption: "Fresh harvest today! 🌱",
        likes: 10,
        recieved_from: "Organic Farmer",
        comments: [
            { user: "FarmerJoe", text: "Looks great!" },
            { user: "AgriTech", text: "Nice yield!" }
        ],
    },
    {
        id: 2,
        username: "GreenFarmer",
        userImage: "/4.jpg",
        image: "/3.jpg",
        caption: "Fresh harvest today! 🌱",
        likes: 10,
        recieved_from: "Organic Farmer",
        comments: [
            { user: "FarmerJoe", text: "Looks great!" },
            { user: "AgriTech", text: "Nice yield!" }
        ],
    },
];

const getFriends = () => [
    { id: 1, name: "FarmerJoe" },
    { id: 2, name: "AgriTech" },
    { id: 3, name: "EcoGrower" },
];

export default function Shared() {
    return <OnClickGet />;
}

const OnClickGet = () => {
    const [posts, setPosts] = useState([]);
    const [friends, setFriends] = useState([]);
    const [sharedPosts, setSharedPosts] = useState([]);
    const [expandedPost, setExpandedPost] = useState(null);

    useEffect(() => {
        setPosts(getPosts());  
        setFriends(getFriends());
    }, []);

    const handleSharePost = (postId, sharedFriends) => {
        const postToShare = posts.find((post) => post.id === postId);
        if (postToShare) {
            sharedFriends.forEach(friend => {
                console.log(`Post ${postId} shared with: ${friend.name}`);
            });
            setSharedPosts((prevSharedPosts) => [
                ...prevSharedPosts,
                { ...postToShare, sharedWith: sharedFriends }
            ]);
        }
    };

    useEffect(() => {
        console.log("Updated Shared Posts:", sharedPosts);
        setSharedPosts(getPosts());
    }, []);

    return (
        <div className="social-feed-container">
             <h2 style={{textAlign:"center"}}>Shared Posts</h2>
             <div className="sharing-container">
            <div className="shared-posts-section">
               
                {sharedPosts.length > 0 ? (
                    <div className="shared-list">
                        {sharedPosts.map((post) => (
                            <div key={post.id} className="shared-preview">
                                <img src={post.image} alt="post" className="small-thumbnail" />
                                <div className="shared-info">
                                    <p><strong>{post.recieved_from}</strong></p>
                                    <p>Likes: {post.likes}</p>
                                </div>
                                <button className="expand-btn" onClick={() => setExpandedPost(post)}>
                                <ArrowRight size={20} />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No shared posts yet.</p>
                )}
            </div>
            <div className="expanded-post-section">
                {expandedPost ? (
                    <div className="expanded-view">
                        <PostCard post={expandedPost} friends={friends} onShare={handleSharePost} />
                        <button className="close-btn" onClick={() => setExpandedPost(null)}>Close</button>
                    </div>
                ) : (
                    <p>Select a post to view details.</p>
                )}
            </div>
            </div>
        </div>
    );
};
