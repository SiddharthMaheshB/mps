import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import PostCard from "./PostCard";
import "./Feed.css";
import "./Postcard.css";
import { ArrowLeft, Home } from "lucide-react";

const PostView = () => {
    const { postId } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [connections, setConnections] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPostAndConnections = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                
                if (!token) {
                    navigate('/login');
                    return;
                }
                
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                };

                // Fetch the specific post
                const response = await axios.get(`http://localhost:5000/api/social/posts/${postId}`, config);
                
                if (!response.data) {
                    throw new Error("Post not found");
                }

                // Get current user ID
                const userId = localStorage.getItem('userId');
                
                // Check if the user has liked the post
                const isLiked = userId && 
                    Array.isArray(response.data.likes) && 
                    response.data.likes.some(id => id === userId);
                
                setPost({
                    ...response.data,
                    isLiked
                });

                // Fetch followers (instead of friends)
                try {
                    const followersResponse = await axios.get('http://localhost:5000/api/social/followers', config);
                    if (followersResponse.data && followersResponse.data.length > 0) {
                        setConnections(followersResponse.data);
                    } else {
                        // Fallback if no followers found
                        setConnections([]);
                    }
                } catch (followerError) {
                    console.error("Error fetching followers:", followerError);
                    setConnections([]);
                }
            } catch (err) {
                console.error("Error fetching post:", err);
                setError(err.message || "Failed to load post");
            } finally {
                setLoading(false);
            }
        };

        fetchPostAndConnections();
    }, [postId, navigate]);

    // Handle liking/unliking the post
    const handleLike = async (postId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                // Redirect to login if not logged in
                navigate('/login');
                return;
            }

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };

            // Call API
            const response = await axios.post(`http://localhost:5000/api/social/posts/${postId}/like`, {}, config);
            
            // Get the current user ID
            const userId = localStorage.getItem('userId');
            
            // Check if user ID is in the likes array
            const userLiked = Array.isArray(response.data.likes) && 
                            response.data.likes.includes(userId);
            
            // Update post state
            setPost(prevPost => ({
                ...prevPost,
                likes: response.data.likes,
                likeCount: response.data.count,
                isLiked: userLiked
            }));
        } catch (err) {
            console.error('Error liking post:', err);
        }
    };

    // Handle adding a comment
    const handleComment = async (postId, commentText) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                // Redirect to login if not logged in
                navigate('/login');
                return;
            }

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };

            // Call API
            const response = await axios.post(
                `http://localhost:5000/api/social/posts/${postId}/comment`,
                { text: commentText },
                config
            );
            
            // Update post in state
            setPost(prevPost => ({
                ...prevPost,
                comments: response.data
            }));
        } catch (err) {
            console.error('Error adding comment:', err);
        }
    };

    // Handle sharing post
    const handleShare = async (postId, selectedConnections) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                // Redirect to login if not logged in
                navigate('/login');
                return;
            }

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };

            // Format connections for the API
            const formattedConnections = selectedConnections.map(connection => ({
                id: connection.id,
                type: 'follower'
            }));
            
            // Call API
            await axios.post(
                `http://localhost:5000/api/social/posts/${postId}/share`,
                { sharedWith: formattedConnections },
                config
            );
            
            // Show success message
            alert(`Post shared successfully with ${selectedConnections.length} connections`);
        } catch (err) {
            console.error('Error sharing post:', err);
        }
    };

    if (loading) {
        return (
            <div className="post-view-container">
                <div className="loading-message">Loading post...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="post-view-container">
                <div className="error-message">{error}</div>
                <div className="navigation-links">
                    <Link to="/social" className="back-button">
                        <Home size={16} /> Feed
                    </Link>
                    <Link to="/social/shared" className="back-button">
                        <ArrowLeft size={16} /> Shared Posts
                    </Link>
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="post-view-container">
                <div className="error-message">Post not found</div>
                <div className="navigation-links">
                    <Link to="/social" className="back-button">
                        <Home size={16} /> Feed
                    </Link>
                    <Link to="/social/shared" className="back-button">
                        <ArrowLeft size={16} /> Shared Posts
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="post-view-container">
            <div className="post-view-header">
                <div className="navigation-links">
                    <Link to="/social" className="back-button">
                        <Home size={16} /> Feed
                    </Link>
                    <Link to="/social/shared" className="back-button">
                        <ArrowLeft size={16} /> Shared Posts
                    </Link>
                </div>
                <h2>Post by {post.username}</h2>
            </div>
            
            <div className="post-view-content">
                <PostCard
                    post={post}
                    connections={connections}
                    onLike={handleLike}
                    onComment={handleComment}
                    onShare={handleShare}
                    showSharer={true}
                />
            </div>
        </div>
    );
};

export default PostView; 