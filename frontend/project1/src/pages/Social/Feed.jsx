import React, { useState, useEffect } from "react";
import PostCard from "./PostCard";
import "./Feed.css";
import img1 from "/6.jpg";

const getPosts = () => [
    {
        id: 1,
        username: "GreenFarmer",
        userImage: "/4.jpg",
        image: "/2.png",
        caption: "Fresh harvest today! 🌱",
        likes: 10,
        comments: [
            { user: "FarmerJoe", text: "Looks great!" },
            { user: "AgriTech", text: "Nice yield!" }
        ],
    },
    {
        id: 2,
        username: "OrganicGrower",
        userImage: "/6.jpg",
        image: img1,
        caption: "Excited to see my crops growing! 🌾",
        likes: 25,
        comments: [],
    },
];

const getFriends = () => [
    { id: 1, name: "FarmerJoe" },
    { id: 2, name: "AgriTech" },
    { id: 3, name: "EcoGrower" },
];

export default function FarmScene({login}) {

    if(!login){
        return (<>404 NOt found</>)
    }
    const [posts, setPosts] = useState([]);
    const [friends, setFriends] = useState([]);
    const [sharedPosts, setSharedPosts] = useState([]); // Store shared posts

    useEffect(() => {
        setPosts(getPosts());  // Fetch dummy posts
        setFriends(getFriends()); // Fetch friends list
    }, []);

    // Handle sharing posts with friends
    const handleSharePost = (postId, sharedFriends) => {
        const postToShare = posts.find((post) => post.id === postId);
        if (postToShare) {
            sharedFriends.forEach(friend => {
                console.log(`Post ${postId} shared with: ${friend.name}`);
            });

            setSharedPosts([...sharedPosts, { ...postToShare, sharedWith: sharedFriends }]);
        }
    };

   

    return (
        <div className="social-feed">
            {posts.length > 0 ? (
                posts.map((post) => (
                    <PostCard key={post.id} post={post} friends={friends} onShare={handleSharePost} />
                ))
            ) : (
                <p>No posts yet. Share your first farm story!</p>
            )}
        </div>
    );
};
