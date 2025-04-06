import React, { useState, useEffect } from "react";
import PostCard from "./PostCard";
import "./Feed.css";
import "./SharedPosts.css"
import { ArrowRight, Share, User, RefreshCw } from "lucide-react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

// Keeps the dummy friends as a fallback
const getDummyFriends = () => [
    { id: 1, name: "FarmerJoe" },
    { id: 2, name: "AgriTech" },
    { id: 3, name: "EcoGrower" },
];

export default function Shared({login}) {
    const navigate = useNavigate();
    
    useEffect(() => {
        // Only redirect if login is explicitly false (not undefined or null)
        if(login === false){
            navigate('/login');
        }
    }, [login, navigate]);
    
    // Don't render if not logged in
    if(login === false){
        return null;
    }
    
    return <SharedContent />;
}

const SharedContent = () => {
    const [posts, setPosts] = useState([]);
    const [friends, setFriends] = useState([]);
    const [sharedPosts, setSharedPosts] = useState([]);
    const [expandedPost, setExpandedPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [refreshing, setRefreshing] = useState(false);
    const navigate = useNavigate();

    const fetchData = async () => {
        setLoading(true);
        setError("");
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No token found');
            }

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };
            
            // Fetch posts
            const postsResponse = await axios.get("http://localhost:5000/api/social/posts", config);
            const { posts: realPosts, dummyPosts } = postsResponse.data;
            
            // Get the current user ID to check like status
            const userId = localStorage.getItem('userId');
            
            // If we have real posts, use them, otherwise use dummy posts
            if (realPosts && realPosts.length > 0) {
                const processedPosts = realPosts.map(post => ({
                    ...post,
                    isLiked: Array.isArray(post.likes) && post.likes.some(id => id === userId)
                }));
                setPosts(processedPosts);
            } else if (dummyPosts && dummyPosts.length > 0) {
                const processedPosts = dummyPosts.map(post => ({
                    ...post,
                    isLiked: Array.isArray(post.likes) && post.likes.includes('currentUser')
                }));
                setPosts(processedPosts);
            } else {
                setPosts([]);
            }
            
            // Try to fetch followers first
            try {
                const followersResponse = await axios.get('http://localhost:5000/api/social/followers', config);
                if (followersResponse.data && followersResponse.data.length > 0) {
                    setFriends(followersResponse.data);
                } else {
                    // Fall back to friends if no followers
                    const friendsResponse = await axios.get("http://localhost:5000/api/social/friends", config);
                    const { friends: realFriends, dummyFriends } = friendsResponse.data;
                    
                    // If we have real friends, use them, otherwise use dummy friends
                    if (realFriends && realFriends.length > 0) {
                        setFriends(realFriends);
                    } else if (dummyFriends && dummyFriends.length > 0) {
                        setFriends(dummyFriends);
                    } else {
                        setFriends(getDummyFriends());
                    }
                }
            } catch (err) {
                console.error("Error fetching followers:", err);
                // Fallback to friends
                const friendsResponse = await axios.get("http://localhost:5000/api/social/friends", config);
                const { friends: realFriends, dummyFriends } = friendsResponse.data;
                
                if (realFriends && realFriends.length > 0) {
                    setFriends(realFriends);
                } else if (dummyFriends && dummyFriends.length > 0) {
                    setFriends(dummyFriends);
                } else {
                    setFriends(getDummyFriends());
                }
            }
            
            // Fetch shared posts
            const sharedPostsResponse = await axios.get("http://localhost:5000/api/social/shared", config);
            const { sharedPosts: realSharedPosts, dummySharedPosts } = sharedPostsResponse.data;
            
            // Process shared posts to determine if current user has liked them
            // If we have real shared posts, use them, otherwise use dummy shared posts
            if (realSharedPosts && realSharedPosts.length > 0) {
                // Filter out deleted posts 
                const nonDeletedSharedPosts = realSharedPosts.filter(post => !post.deleted);
                
                const processedSharedPosts = nonDeletedSharedPosts.map(post => {
                    // Ensure we have sharer username either from sharerUsername or from sharedBy[0].sharerUsername
                    let sharerUsername = post.sharerUsername || 
                                     (post.sharedBy && post.sharedBy.length > 0 && post.sharedBy[0].sharerUsername) || 
                                     post.recieved_from || 
                                     "Unknown";
                    
                    // Ensure we have sharer avatar
                    let sharerAvatar = post.sharerAvatar || 
                                    (post.sharedBy && post.sharedBy.length > 0 && post.sharedBy[0].sharerAvatar) || 
                                    "/1.png";
                                     
                    return {
                        ...post,
                        sharerUsername: sharerUsername,
                        sharerAvatar: sharerAvatar,
                        isLiked: Array.isArray(post.likes) && post.likes.some(id => id === userId)
                    };
                });
                setSharedPosts(processedSharedPosts);
                console.log(`Loaded ${processedSharedPosts.length} non-deleted shared posts`);
            } else {
                // Don't display dummy shared posts if there are no real ones
                setSharedPosts([]);
            }
        } catch (err) {
            console.error("Error fetching data:", err);
            setError("Failed to load data. Please try again later.");
            
            // Don't fall back to dummy data if API calls fail
            setSharedPosts([]);
            setFriends(getDummyFriends());
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };
    
    // Initial data load
    useEffect(() => {
        fetchData();
    }, []);

    // Handle refreshing shared posts
    const handleRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    // Handle liking/unliking posts
    const handleLike = async (postId) => {
        try {
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

            // Get the current user ID to check like status
            const userId = localStorage.getItem('userId');

            // Check if post is from API or dummy data
            const isRealPost = typeof postId === 'string' && postId.match(/^[0-9a-fA-F]{24}$/);
            
            if (isRealPost) {
                // Call API for real posts
                const response = await axios.post(`http://localhost:5000/api/social/posts/${postId}/like`, {}, config);
                
                // Update post in state with the updated likes array from the server
                setSharedPosts(prevPosts => prevPosts.map(post => {
                    if (post._id === postId) {
                        // Check if user ID is in the likes array to determine if post is liked
                        const userLiked = Array.isArray(response.data.likes) && 
                                        response.data.likes.some(id => id === userId);
                        
                        const updatedPost = { 
                            ...post, 
                            likes: response.data.likes,
                            likeCount: response.data.count,
                            isLiked: userLiked
                        };
                        
                        return updatedPost;
                    }
                    return post;
                }));
                
                // Update expanded post if it's the one that was liked/unliked
                if (expandedPost && expandedPost._id === postId) {
                    const userLiked = Array.isArray(response.data.likes) && 
                                     response.data.likes.some(id => id === userId);
                    
                    setExpandedPost({
                        ...expandedPost,
                        likes: response.data.likes,
                        likeCount: response.data.count,
                        isLiked: userLiked
                    });
                }
            } else {
                // Handle dummy posts locally
                setSharedPosts(prevPosts => prevPosts.map(post => {
                    if (post.id === postId) {
                        const isLiked = post.isLiked || false;
                        const newLikes = isLiked 
                            ? (Array.isArray(post.likes) ? post.likes.filter(id => id !== 'currentUser') : post.likes - 1) 
                            : (Array.isArray(post.likes) ? [...post.likes, 'currentUser'] : post.likes + 1);
                        
                        const updatedPost = {
                            ...post,
                            isLiked: !isLiked,
                            likes: newLikes
                        };
                        
                        // Update expanded post if it's the one that was liked/unliked
                        if (expandedPost && expandedPost.id === postId) {
                            setExpandedPost(updatedPost);
                        }
                        
                        return updatedPost;
                    }
                    return post;
                }));
            }
        } catch (err) {
            console.error('Error liking post:', err);
        }
    };

    // Handle adding a comment
    const handleComment = async (postId, commentText) => {
        try {
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

            // Check if post is from API or dummy data
            const isRealPost = typeof postId === 'string' && postId.match(/^[0-9a-fA-F]{24}$/);
            
            if (isRealPost) {
                // Call API for real posts
                const response = await axios.post(
                    `http://localhost:5000/api/social/posts/${postId}/comment`,
                    { text: commentText },
                    config
                );
                
                // Update post in state
                setSharedPosts(prevPosts => prevPosts.map(post => 
                    post._id === postId ? { ...post, comments: response.data } : post
                ));
                
                if (expandedPost && expandedPost._id === postId) {
                    setExpandedPost({
                        ...expandedPost,
                        comments: response.data
                    });
                }
            } else {
                // Handle dummy posts locally
                const newComment = { user: "You", text: commentText };
                
                setSharedPosts(prevPosts => prevPosts.map(post => {
                    if (post.id === postId) {
                        const updatedPost = {
                            ...post,
                            comments: [...(post.comments || []), newComment]
                        };
                        
                        if (expandedPost && expandedPost.id === postId) {
                            setExpandedPost(updatedPost);
                        }
                        
                        return updatedPost;
                    }
                    return post;
                }));
            }
        } catch (err) {
            console.error('Error adding comment:', err);
        }
    };

    const handleSharePost = async (postId, sharedFriends) => {
        try {
            // Get names and ids of friends to share with
            const friendNames = sharedFriends.map(friend => friend.name);
            const friendIds = sharedFriends.map(friend => friend.id);
            
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

            // Check if post is from API or dummy data
            const isRealPost = typeof postId === 'string' && postId.match(/^[0-9a-fA-F]{24}$/);
            
            if (isRealPost) {
                // Call API for real posts
                await axios.post(
                    `http://localhost:5000/api/social/posts/${postId}/share`,
                    { friendIds, sharedWith: friendNames },
                    config
                );
                
                // Show success message
                alert(`Post shared with ${friendNames.join(', ')}`);
                
                // Refresh shared posts from server
                fetchData();
            } else {
                // For dummy posts: find the post and add it to shared posts if not already there
                const postToShare = posts.find((post) => post.id === postId);
                if (postToShare) {
                    // Update local state - only add if not already in shared posts
                    const alreadyShared = sharedPosts.some(post => post.id === postId);
                    if (!alreadyShared) {
                        setSharedPosts(prevPosts => [
                            ...prevPosts,
                            { ...postToShare, sharedWith: sharedFriends }
                        ]);
                    }
                    
                    // Show success message
                    alert(`Post shared with ${friendNames.join(', ')}`);
                }
            }
        } catch (err) {
            console.error("Error sharing post:", err);
            setError("Failed to share post. Please try again.");
        }
    };

    // Render different states
    if (loading) {
        return (
            <div className="social-feed-container">
                <h2 style={{textAlign:"center"}}>Shared Posts</h2>
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p className="loading-message">Loading shared posts...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="social-feed-container">
            <div className="shared-header">
                <h2>Shared Posts</h2>
                <button 
                    className="refresh-button" 
                    onClick={handleRefresh}
                    disabled={refreshing}
                >
                    <RefreshCw size={16} className={refreshing ? 'spinning' : ''} />
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="sharing-container">
                <div className="shared-posts-section">
                    {!loading && sharedPosts.length > 0 ? (
                        <div className="shared-list">
                            {sharedPosts.map((post) => (
                                <div key={post._id || post.id} className="shared-preview">
                                    {post.image && post.image.trim() !== '' ? (
                                        <img 
                                            src={post.image} 
                                            alt="post" 
                                            className="small-thumbnail"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "/default-post.jpg";
                                            }}
                                        />
                                    ) : (
                                        <div className="text-content-preview">
                                            <span>Text post</span>
                                        </div>
                                    )}
                                    <div className="shared-info">
                                        <p className="shared-username">
                                            <Link to={`/social/profile/${post.username}`}>
                                                <strong>{post.username}</strong>
                                            </Link>'s post
                                        </p>
                                        <p className="shared-from">
                                            <img 
                                                src={post.sharerAvatar || "/1.png"} 
                                                alt="Sharer" 
                                                className="sharer-thumbnail"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = "/1.png";
                                                }}
                                            />
                                            <strong>Shared by:</strong> <Link to={`/social/profile/${post.sharerUsername}`}>{post.sharerUsername}</Link>
                                        </p>
                                        <p className="shared-likes">
                                            <strong>Likes:</strong> {Array.isArray(post.likes) ? post.likes.length : (post.likes || 0)}
                                        </p>
                                    </div>
                                    <button className="expand-btn" onClick={() => {
                                        // Ensure expandedPost includes sharerUsername
                                        setExpandedPost({
                                            ...post,
                                            sharedBy: [{
                                                user: post.user,
                                                sharerUsername: post.sharerUsername,
                                                sharerAvatar: post.sharerAvatar,
                                                timestamp: post.timestamp || new Date()
                                            }]
                                        });
                                    }}>
                                        <ArrowRight size={20} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-shared-posts">
                            <Share size={40} />
                            <h3>No shared posts yet</h3>
                            <p>Posts that others share with you will appear here.</p>
                            <Link to="/social" className="view-feed-button">
                                View Feed to Share Posts
                            </Link>
                        </div>
                    )}
                </div>
                
                <div className="expanded-post-section">
                    {expandedPost ? (
                        <div className="expanded-view">
                            <PostCard 
                                post={expandedPost} 
                                connections={friends} 
                                onLike={handleLike}
                                onComment={handleComment}
                                onShare={handleSharePost}
                                showSharer={true}
                            />
                            <div className="post-actions-container">
                                <button className="close-btn" onClick={() => setExpandedPost(null)}>Close</button>
                            </div>
                        </div>
                    ) : (
                        <div className="select-post-message">
                            <User size={40} />
                            <p>Select a post to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
