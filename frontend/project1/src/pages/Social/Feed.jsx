import React, { useState, useEffect } from "react";
import PostCard from "./PostCard";
import "./Feed.css";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus, Users, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";

export default function FarmScene({login}) {
    const [posts, setPosts] = useState([]);
    const [friends, setFriends] = useState([]);
    const [followers, setFollowers] = useState([]);
    const [connections, setConnections] = useState([]);
    const [allFarmers, setAllFarmers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [showFollowers, setShowFollowers] = useState(false);
    const navigate = useNavigate();

    if(!login){
        navigate('/');
        return null;
    }

    // Define fetchData outside useEffect so it can be called from elsewhere
        const fetchData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No token found');
                }

                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                };

            // Fetch posts - we only want real posts, no dummy data
                const postsResponse = await axios.get('http://localhost:5000/api/social/posts', config);
                
                // Process posts to determine if current user has liked them
                const userId = localStorage.getItem('userId');
            
            if (postsResponse.data.posts && postsResponse.data.posts.length > 0) {
                // Filter out posts that are marked as deleted before processing
                const nonDeletedPosts = postsResponse.data.posts.filter(post => 
                    !post.deleted && post.caption && (post.image || post.content)
                );
                
                // Process remaining non-deleted posts with user like status
                const processPosts = nonDeletedPosts.map(post => {
                    return {
                        ...post,
                        isLiked: Array.isArray(post.likes) && post.likes.includes(userId)
                    };
                });
                    setPosts(processPosts);
                console.log(`Loaded ${processPosts.length} non-deleted posts from all users`);
            } else {
                // If no posts are available, set empty array (no dummy data)
                setPosts([]);
                console.log("No posts found in the system");
            }

            // Fetch followers - we'll treat all connections as followers
            const followersResponse = await axios.get('http://localhost:5000/api/social/followers', config);
            
            // Process followers
            let followersList = [];
            if (followersResponse.data && followersResponse.data.length > 0) {
                followersList = followersResponse.data.map(follower => ({
                    ...follower,
                    isFollower: true
                }));
                setFollowers(followersList);
                console.log(`Loaded ${followersList.length} followers`);
                } else {
                setFollowers([]);
            }

            // Also fetch friends for backward compatibility, but treat them as followers
            const friendsResponse = await axios.get('http://localhost:5000/api/social/friends', config);
            
            // Process friends as followers
            let additionalFollowers = [];
            if (friendsResponse.data.friends && friendsResponse.data.friends.length > 0) {
                additionalFollowers = friendsResponse.data.friends.map(friend => ({
                    ...friend,
                    isFollower: true
                }));
                console.log(`Loaded ${additionalFollowers.length} friends as followers`);
            }
            
            // Combine all connections, removing duplicates
            const allConnections = [...followersList];
            
            // Add friends that aren't already in the followers list
            additionalFollowers.forEach(friend => {
                const isDuplicate = allConnections.some(
                    connection => connection.id === friend.id
                );
                
                if (!isDuplicate) {
                    allConnections.push(friend);
                }
            });
            
            setFriends([]); // We're not going to use separate friends anymore
            setConnections(allConnections);
            console.log(`Combined ${allConnections.length} total followers`);

            // Create a set of connection IDs for faster lookup
            const connectionIdSet = new Set();
            
            // Process the connections to ensure we capture all IDs in various formats
            allConnections.forEach(conn => {
                // Add the ID in both string and ObjectId format
                if (conn.id) connectionIdSet.add(conn.id);
                if (conn._id) connectionIdSet.add(conn._id);
            });

            // Also add the current user's ID to the set (to exclude self)
            const currentUserId = localStorage.getItem('userId');
            if (currentUserId) connectionIdSet.add(currentUserId);

            // Fetch all farmers suggestions (users of the app)
            const suggestionsResponse = await axios.get('http://localhost:5000/api/social/friends/suggestions', config);
            if (suggestionsResponse.data && suggestionsResponse.data.length > 0) {
                // Filter out any users that the current user is already following
                const filteredFarmers = suggestionsResponse.data.filter(farmer => {
                    // Check both _id and id fields to ensure we catch all connections
                    return !connectionIdSet.has(farmer._id) && 
                           !connectionIdSet.has(farmer._id.toString()) && 
                           !connectionIdSet.has(farmer.id);
                });
                
                setAllFarmers(filteredFarmers);
                console.log(`Loaded ${filteredFarmers.length} farmer suggestions (excluding already followed users)`);
            }

            // Fetch user information for shared posts (to display correct sharer name)
            if (postsResponse.data.posts) {
                // Filter out any deleted posts first
                const nonDeletedPosts = postsResponse.data.posts.filter(post => 
                    !post.deleted && post.caption && (post.image || post.content)
                );
                
                // Then identify shared posts from the remaining non-deleted posts
                const sharedPosts = nonDeletedPosts.filter(post => 
                    post.sharedBy && post.sharedBy.length > 0
                );
                
                // For each shared post, fetch the sharer's information
                const userPromises = sharedPosts.flatMap(post => 
                    post.sharedBy.map(share => 
                        axios.get(`http://localhost:5000/api/social/profile/${share.user}`, config)
                            .catch(err => ({ data: null })) // Catch errors for individual user fetches
                    )
                );
                
                if (userPromises.length > 0) {
                    const userResponses = await Promise.all(userPromises);
                    
                    // Create a mapping of user IDs to usernames
                    const userMap = {};
                    userResponses.forEach(response => {
                        if (response.data && response.data._id) {
                            userMap[response.data._id] = response.data.username;
                        }
                    });
                    
                    // Update the posts with the sharer information
                    const updatedPosts = nonDeletedPosts.map(post => {
                        if (post.sharedBy && post.sharedBy.length > 0) {
                            return {
                                ...post,
                                sharedBy: post.sharedBy.map(share => ({
                                    ...share,
                                    sharerUsername: userMap[share.user] || "Unknown"
                                }))
                            };
                        }
                        return post;
                    });
                    
                    // Update posts state with sharer information
                    setPosts(updatedPosts.map(post => ({
                        ...post,
                        isLiked: Array.isArray(post.likes) && post.likes.includes(userId)
                    })));
                }
                }

            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err.message || 'Failed to fetch data');
                
            // Don't fall back to dummy data, just set empty arrays
            setPosts([]);
            setFriends([]);
            setFollowers([]);
            setConnections([]);
            setAllFarmers([]);
            } finally {
                setLoading(false);
            }
        };

    useEffect(() => {
        fetchData();
    }, []);

    // Handle liking/unliking posts
    const handleLike = async (postId) => {
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

            // Only handle real posts (those with MongoDB ObjectIDs)
            if (typeof postId === 'string' && postId.match(/^[0-9a-fA-F]{24}$/)) {
                // Call API for real posts
                const response = await axios.post(`http://localhost:5000/api/social/posts/${postId}/like`, {}, config);
                
                // Get the current user ID to check like status
                const userId = localStorage.getItem('userId');
                
                // Update post in state
                setPosts(prevPosts => prevPosts.map(post => {
                    if (post._id === postId) {
                        // Check if user ID is in the likes array to determine if post is liked
                        const userLiked = Array.isArray(response.data.likes) && 
                                        response.data.likes.includes(userId);
                        
                        return { 
                            ...post, 
                            likes: response.data.likes,
                            likeCount: response.data.count,
                            isLiked: userLiked
                        };
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
                throw new Error('No token found');
            }

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };

            // Only handle real posts
            if (typeof postId === 'string' && postId.match(/^[0-9a-fA-F]{24}$/)) {
                // Call API for real posts
                const response = await axios.post(
                    `http://localhost:5000/api/social/posts/${postId}/comment`,
                    { text: commentText },
                    config
                );
                
                // Update post in state
                setPosts(prevPosts => prevPosts.map(post => 
                    post._id === postId ? { ...post, comments: response.data } : post
                ));
            }
        } catch (err) {
            console.error('Error adding comment:', err);
        }
    };

    // Handle sharing posts with followers
    const handleSharePost = async (postId, sharedConnections) => {
        try {
            // Format connections - all are treated as followers now
            const formattedConnections = sharedConnections.map(connection => ({
                id: connection.id,
                type: 'follower'
            }));
            
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No token found');
            }

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };

            // Only handle real posts
            if (typeof postId === 'string' && postId.match(/^[0-9a-fA-F]{24}$/)) {
                // Call API to share post with the formatted connections
                const response = await axios.post(
                    `http://localhost:5000/api/social/posts/${postId}/share`,
                    { sharedWith: formattedConnections },
                    config
                );
                
                // Show success message
                console.log(`Post ${postId} shared with ${sharedConnections.length} followers`);
                
                // You could add a notification system here
                if (response.data.success) {
                    // Maybe show a toast notification?
                    console.log(`Post shared successfully! Share count: ${response.data.shareCount}`);
                }
            }
        } catch (err) {
            console.error('Error sharing post:', err);
            // Handle errors - maybe show error notification
        }
    };

    // Add a refresh function to sync with backend
    const refreshNetworkData = async () => {
        try {
            setRefreshing(true);
            console.log('Refreshing network data...');
            
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No token found');
            }

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };

            // Fetch followers
            const followersResponse = await axios.get('http://localhost:5000/api/social/followers', config);
            
            // Process followers
            let followersList = [];
            if (followersResponse.data && followersResponse.data.length > 0) {
                followersList = followersResponse.data.map(follower => ({
                    ...follower,
                    isFollower: true
                }));
                console.log(`Refreshed: Loaded ${followersList.length} followers`);
                setFollowers(followersList);
                setConnections(followersList);
            } else {
                setFollowers([]);
                setConnections([]);
            }

            // Create a set of connection IDs for faster lookup
            const connectionIdSet = new Set();
            followersList.forEach(conn => {
                if (conn.id) connectionIdSet.add(conn.id);
            });

            // Add the current user's ID to the set (to exclude self)
            const currentUserId = localStorage.getItem('userId');
            if (currentUserId) connectionIdSet.add(currentUserId);

            // Fetch all farmers suggestions
            const suggestionsResponse = await axios.get('http://localhost:5000/api/social/friends/suggestions', config);
            
            if (suggestionsResponse.data && suggestionsResponse.data.length > 0) {
                console.log(`Refreshed: Found ${suggestionsResponse.data.length} user suggestions`);
                
                // Log all suggestion IDs for debugging
                console.log('Suggestion IDs:', suggestionsResponse.data.map(user => user._id));
                
                // Log all connection IDs for debugging
                console.log('Connection IDs:', Array.from(connectionIdSet));
                
                // Filter out users that are already in connections
                const filteredFarmers = suggestionsResponse.data.filter(farmer => {
                    // Check if farmer is in connections
                    const isInConnections = !connectionIdSet.has(farmer._id) && 
                                           !connectionIdSet.has(farmer._id.toString());
                    
                    if (!isInConnections) {
                        console.log(`Excluding user ${farmer.username} (${farmer._id}) from suggestions - already connected`);
                    }
                    
                    return isInConnections;
                });
                
                setAllFarmers(filteredFarmers);
                console.log(`Refreshed: Filtered to ${filteredFarmers.length} suggestions after removing existing connections`);
            } else {
                setAllFarmers([]);
            }
            
        } catch (err) {
            console.error('Error refreshing network data:', err);
        } finally {
            setRefreshing(false);
        }
    };

    // Handle following a user/farmer
    const handleFollowUser = async (userId) => {
        try {
            // Find the farmer details from allFarmers
            const farmerToFollow = allFarmers.find(farmer => farmer._id === userId);
            
            if (!farmerToFollow) {
                console.error(`Could not find farmer with ID ${userId} in suggestions list`);
                return;
            }
            
            console.log(`Attempting to follow user: ${farmerToFollow.username} (${userId})`);
            
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No token found');
            }

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };

            // Call the follow API endpoint
            const response = await axios.post(`http://localhost:5000/api/social/follow/${userId}`, {}, config);
            
            if (response.data.success) {
                console.log(`Successfully followed user: ${farmerToFollow.username}`, response.data);
                
                // Remove the followed user from allFarmers
                setAllFarmers(prevFarmers => prevFarmers.filter(farmer => farmer._id !== userId));
                
                // Immediately get fresh suggestion list to maintain 10 users
                try {
                    const suggestionsResponse = await axios.get('http://localhost:5000/api/social/friends/suggestions', config);
                    
                    if (suggestionsResponse.data && suggestionsResponse.data.length > 0) {
                        console.log(`Fetched ${suggestionsResponse.data.length} new user suggestions after follow action`);
                        
                        // Create a set of connection IDs for faster lookup, including the just-followed user
                        const connectionIdSet = new Set([userId]);
                        
                        // Add all current connections to the set
                        connections.forEach(conn => {
                            if (conn.id) connectionIdSet.add(conn.id);
                            if (conn._id) connectionIdSet.add(conn._id);
                        });
                        
                        // Add the current user ID
                        const currentUserId = localStorage.getItem('userId');
                        if (currentUserId) connectionIdSet.add(currentUserId);
                        
                        // Filter suggestions to remove any users already connected with
                        const filteredFarmers = suggestionsResponse.data.filter(farmer => 
                            !connectionIdSet.has(farmer._id) && 
                            !connectionIdSet.has(farmer._id.toString())
                        );
                        
                        // Combine the new suggestions with existing ones (excluding followed user)
                        const currentFarmers = allFarmers.filter(farmer => farmer._id !== userId);
                        
                        // Ensure we don't have duplicates
                        const existingIds = new Set(currentFarmers.map(farmer => farmer._id));
                        const newUniqueFarmers = filteredFarmers.filter(farmer => !existingIds.has(farmer._id));
                        
                        // Combine and limit to 10
                        const combinedFarmers = [...currentFarmers, ...newUniqueFarmers].slice(0, 10);
                        
                        console.log(`Updated suggestions list with ${combinedFarmers.length} users`);
                        setAllFarmers(combinedFarmers);
                    }
                } catch (suggestionsErr) {
                    console.error('Error fetching new suggestions after follow:', suggestionsErr);
                }
                
                // After successful follow, also update the followers/following data
                await refreshNetworkData();
                
            } else {
                console.warn(`Follow API returned success:false - user might already be followed`);
            }
        } catch (err) {
            console.error('Error following user:', err);
            // If there's an error, refresh the data to ensure UI is consistent
            refreshNetworkData();
        }
    };

    // Filter connections based on active tab - simplified since we only have followers now
    const getFilteredConnections = () => {
        return connections; // All connections are followers now
    };

    // Add a function to handle post deletion
    const handleDeletePost = async (postId) => {
        try {
            if (!window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
                return;
            }

            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No token found');
            }

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };

            // Call API to delete the post
            const response = await axios.delete(`http://localhost:5000/api/social/posts/${postId}`, config);
            
            if (response.data.success) {
                console.log(`Successfully deleted post: ${postId}`);
                
                // Completely remove the post from the local state immediately
                setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
                
                // Show success message
                alert("Post successfully deleted.");
            } else {
                throw new Error(response.data.message || 'Failed to delete post');
            }
        } catch (err) {
            console.error('Error deleting post:', err);
            alert("Failed to delete post. Please try again later.");
        }
    };

    // Render feed
    return (
        <div className="farm-scene-container">
            <div className="left-sidebar">
                <div className="network-header">
                    <h3>My Network</h3>
                </div>
                <div className="connection-tabs">
                    <button 
                        className={`tab-btn ${showFollowers ? 'active' : ''}`}
                        onClick={() => {
                            // Toggle the visibility of the friends list
                            setShowFollowers(!showFollowers);
                        }}
                    >
                        Followers ({connections.length})
                        {showFollowers ? <ChevronUp size={16} className="tab-icon" /> : <ChevronDown size={16} className="tab-icon" />}
                    </button>
                </div>
                
                <div className={`friends-list ${showFollowers ? 'visible' : ''}`}>
                    {connections.length > 0 ? (
                        connections.map(connection => (
                            <div key={connection.id} className="friend-item">
                                <img 
                                    src={connection.avatar || "/1.png"} 
                                    alt={connection.name}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "/1.png";
                                    }}
                                />
                                <Link to={`/social/profile/${connection.name}`} className="connection-name">
                                    {connection.name}
                                </Link>
                                <span className="connection-label">Follower</span>
                            </div>
                        ))
                    ) : (
                        <div className="empty-connections">
                            <p>No followers found.</p>
                            <p className="small-text">When others follow you, they'll appear here</p>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="feed-container">
                <div className="feed-header">
                    <h2>Community Feed</h2>
                    <p>See what farmers across the network are sharing</p>
                </div>
                
                {loading ? (
                    <div className="loading-indicator">Loading posts...</div>
                ) : error ? (
                    <div className="error-message">{error}</div>
                ) : posts.length > 0 ? (
                    posts.map((post) => {
                        // Check if post belongs to current user to show delete option
                        const userId = localStorage.getItem('userId');
                        const isOwnPost = post.user === userId || post.userId === userId;
                        
                        return (
                            <div key={post._id || post.id} className="post-wrapper">
                    <PostCard 
                        key={post._id || post.id} 
                        post={post} 
                                    connections={connections}
                        onLike={handleLike}
                        onComment={handleComment}
                        onShare={handleSharePost}
                                    showSharer={false}
                                />
                                {isOwnPost && (
                                    <div className="post-owner-actions">
                                        <button 
                                            onClick={() => handleDeletePost(post._id)} 
                                            className="delete-post-btn"
                                            title="Delete this post"
                                        >
                                            Delete Post
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="no-posts-message">
                        <h3>No posts yet</h3>
                        <p>Be the first to create a post and share with the farming community!</p>
                        <button 
                            onClick={() => navigate('/social/new-post')}
                            className="create-post-button"
                        >
                            Create a Post
                        </button>
                    </div>
                )}
            </div>
            
            <div className="right-sidebar">
                <div className="find-connections">
                    <div className="network-header">
                        <h3>Grow Your Network</h3>
                        <button 
                            className="refresh-btn" 
                            onClick={refreshNetworkData}
                            disabled={refreshing}
                        >
                            <RefreshCw size={16} className={refreshing ? 'spinning' : ''} />
                        </button>
                    </div>
                    <div className="farmers-list">
                        {allFarmers.length > 0 ? (
                            allFarmers.map(farmer => (
                                <div key={farmer._id} className="farmer-item">
                                    <img 
                                        src={farmer.avatar || "/1.png"} 
                                        alt={farmer.username}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "/1.png";
                                        }}
                                    />
                                    <div className="farmer-info">
                                        <Link to={`/social/profile/${farmer.username}`} className="farmer-name">
                                            {farmer.username}
                                        </Link>
                                        <button 
                                            className="follow-btn"
                                            onClick={() => handleFollowUser(farmer._id)}
                                        >
                                            <UserPlus size={14} /> Follow
                                        </button>
                                    </div>
                                </div>
                ))
            ) : (
                            <div className="no-farmers-message">
                                <p>No new farmers to discover</p>
                                <small>You're connected with everyone in the community!</small>
                            </div>
            )}
                    </div>
                </div>
            </div>
        </div>
    );
}
