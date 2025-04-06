import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import "./Profile.css";
import axios from "axios";

export default function SocialProfile() {
    const { username } = useParams();
    const [user, setUser] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showFollowersModal, setShowFollowersModal] = useState(false);
    const [showFollowingModal, setShowFollowingModal] = useState(false);
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [loadingConnections, setLoadingConnections] = useState(false);
    const navigate = useNavigate();

    // Debug log to check the username parameter
    useEffect(() => {
        console.log("Profile page - Username parameter:", username);
    }, [username]);

    useEffect(() => {
        const fetchUserProfile = async () => {
            setLoading(true);
            setError("");
            
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
                
                // Try to get user data from localStorage first for faster display
                let userData = null;
                const userJson = localStorage.getItem('user');
                if (userJson && username === 'me') {
                    try {
                        userData = JSON.parse(userJson);
                        console.log("Loaded user data from localStorage:", userData);
                    } catch (err) {
                        console.warn("Failed to parse user data from localStorage", err);
                    }
                }
                
                // Get the current logged-in user info first
                let currentUserDetails = null;
                let isCurrentUserProfile = false;
                let targetUsername = username;
                
                try {
                    // If we have user data from localStorage and username is 'me',
                    // use that instead of making an API call
                    if (userData && username === 'me') {
                        currentUserDetails = userData;
                        isCurrentUserProfile = true;
                        targetUsername = userData.username;
                    } else {
                        // Use API endpoint that matches your backend
                        const currentUserResponse = await axios.get("http://localhost:5000/api/auth/profile", config);
                        currentUserDetails = currentUserResponse.data;
                        console.log("Current logged-in user:", currentUserDetails);
                        
                        // Handle 'me' username parameter
                        if (username === 'me') {
                            isCurrentUserProfile = true;
                            targetUsername = currentUserDetails.username;
                        } else if (username === currentUserDetails.username) {
                            isCurrentUserProfile = true;
                        }
                    }
                } catch (err) {
                    console.error("Error fetching current user:", err);
                    // Don't navigate away on error, just show an error message
                    setError("Failed to load profile data. Please try again.");
                    setLoading(false);
                    return;
                }
                
                console.log(`Is this the current user's profile? ${isCurrentUserProfile}`);
                console.log(`Target username: ${targetUsername}`);
                
                if (isCurrentUserProfile) {
                    // Fetching current user's full profile
                    try {
                        // Get social profile data
                        let socialData = null;
                        try {
                            const socialResponse = await axios.get("http://localhost:5000/api/social/profile/me", config);
                            socialData = socialResponse.data;
                            console.log("Current user social data:", socialData);
                        } catch (socialErr) {
                            console.warn("Could not fetch social profile, using auth data only:", socialErr);
                        }
                        
                        // Create full user profile combining auth and social data
                        const userData = {
                            _id: currentUserDetails._id,
                            name: currentUserDetails.username,
                            username: currentUserDetails.username,
                            email: currentUserDetails.email,
                            profilePic: currentUserDetails.avatar || "/1.png",
                            bio: socialData?.bio || "Farmer at FarmConnect",
                            farmLocation: socialData?.farmLocation || "India",
                            followers: socialData?.followers || 0,
                            following: socialData?.following || 0,
                            posts: socialData?.posts || []
                        };
                        
                        setUser(userData);
                        console.log("Setting user data for current user:", userData);
                    } catch (err) {
                        console.error("Error creating current user profile:", err);
                        setError("Failed to load your profile");
                    }
                } else if (targetUsername) {
                    // Fetching another user's profile
                    try {
                        console.log(`Fetching profile for user: ${targetUsername}`);
                        const response = await axios.get(`http://localhost:5000/api/social/profile/${targetUsername}`, config);
                        
                        if (response.data) {
                            setUser(response.data);
                            console.log("Other user profile loaded:", response.data);
                            
                            // Check follow status for other users
                            try {
                                const followResponse = await axios.get(
                                    `http://localhost:5000/api/social/follow/status/${response.data._id || targetUsername}`, 
                                    config
                                );
                        setIsFollowing(followResponse.data.isFollowing);
                                console.log("Follow status:", followResponse.data.isFollowing);
                            } catch (followErr) {
                                console.error("Follow status check error:", followErr);
                                setIsFollowing(false);
                            }
                        }
                    } catch (err) {
                        console.error(`Error fetching user profile for ${targetUsername}:`, err);
                        setError(`User "${targetUsername}" not found.`);
                    }
                } else {
                    // No username specified, use current user
                    // Update URL without a full page navigation
                    navigate('/social/profile/me', { replace: true });
                }
            } catch (err) {
                console.error("General error in profile fetch:", err);
                setError("Failed to load profile. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        
        fetchUserProfile();
    }, [username, navigate]);

    const toggleFollow = async () => {
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
            
            if (isFollowing) {
                await axios.post(`http://localhost:5000/api/social/unfollow/${user._id || user.username}`, {}, config);
            } else {
                await axios.post(`http://localhost:5000/api/social/follow/${user._id || user.username}`, {}, config);
            }
            
            setIsFollowing(!isFollowing);
            
            // Update follower count
            setUser(prev => ({
                ...prev,
                followers: isFollowing ? prev.followers - 1 : prev.followers + 1
            }));
        } catch (err) {
            console.error("Error toggling follow status:", err);
        }
    };

    const fetchUserFollowers = async (userId) => {
        setLoadingConnections(true);
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
            
            const response = await axios.get('http://localhost:5000/api/social/followers', config);
            
            if (response.data && Array.isArray(response.data)) {
                // Process follower data to ensure all needed fields
                const processedFollowers = response.data.map(follower => ({
                    ...follower,
                    _id: follower._id || `follower-${Math.random()}`,
                    username: follower.username || follower.name || "User",
                    avatar: follower.avatar || follower.profilePic || "/1.png"
                }));
                setFollowers(processedFollowers);
            } else {
                setFollowers([]);
            }
        } catch (err) {
            console.error("Error fetching followers:", err);
            setFollowers([]);
        } finally {
            setLoadingConnections(false);
        }
    };

    const fetchUserFollowing = async (userId) => {
        setLoadingConnections(true);
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
            
            const response = await axios.get('http://localhost:5000/api/social/following', config);
            
            if (response.data && Array.isArray(response.data)) {
                // Process following data to ensure all needed fields
                const processedFollowing = response.data.map(following => ({
                    ...following,
                    _id: following._id || `following-${Math.random()}`,
                    username: following.username || following.name || "User",
                    avatar: following.avatar || following.profilePic || "/1.png"
                }));
                setFollowing(processedFollowing);
            } else {
                setFollowing([]);
            }
        } catch (err) {
            console.error("Error fetching following:", err);
            setFollowing([]);
        } finally {
            setLoadingConnections(false);
        }
    };

    const handleFollowersClick = () => {
        fetchUserFollowers(user._id);
        setShowFollowersModal(true);
    };

    const handleFollowingClick = () => {
        fetchUserFollowing(user._id);
        setShowFollowingModal(true);
    };

    const handleFollowUser = async (userId) => {
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
            
            await axios.post(`http://localhost:5000/api/social/follow/${userId}`, {}, config);
            
            // Refresh connections
            if (showFollowersModal) {
                fetchUserFollowers(user._id);
            } else if (showFollowingModal) {
                fetchUserFollowing(user._id);
            }
        } catch (err) {
            console.error("Error following user:", err);
        }
    };

    const handleUnfollowUser = async (userId) => {
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
            
            await axios.post(`http://localhost:5000/api/social/unfollow/${userId}`, {}, config);
            
            // Refresh connections
            if (showFollowersModal) {
                fetchUserFollowers(user._id);
            } else if (showFollowingModal) {
                fetchUserFollowing(user._id);
            }
        } catch (err) {
            console.error("Error unfollowing user:", err);
        }
    };

    const handleUserClick = (clickedUsername) => {
        // Only navigate if the clicked username is different from current
        if (clickedUsername !== username) {
            setShowFollowersModal(false);
            setShowFollowingModal(false);
            navigate(`/social/profile/${clickedUsername}`);
        }
    };

    if (loading) return <p>Loading profile...</p>;
    if (error) return (
        <div className="profile-page-wrapper">
            <div className="social-profile-container">
                <div className="error-message">
                    <h3>Error</h3>
                    <p>{error}</p>
                    <Link to="/social" className="create-post-btn">Back to Feed</Link>
                </div>
            </div>
        </div>
    );
    if (!user) return (
        <div className="profile-page-wrapper">
            <div className="social-profile-container">
                <div className="error-message">
                    <h3>User Not Found</h3>
                    <p>The user you're looking for doesn't exist or has been removed.</p>
                    <Link to="/social" className="create-post-btn">Back to Feed</Link>
                </div>
            </div>
        </div>
    );

    // Check if this is the current user's profile
    const currentUserData = JSON.parse(localStorage.getItem('user') || '{}');
    const isOwnProfile = (username === 'me' || (user && currentUserData && user.username === currentUserData.username));

    return (
        <div className="profile-page-wrapper">
            <div className="social-profile-container">
                <div className="social-profile-header">
                    <div className="profile-pic-container">
                        <img 
                            src={user.profilePic || "/1.png"} 
                            alt="Profile" 
                            className="social-profile-pic"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/1.png";
                            }}
                        />
                    </div>
                    <div className="social-profile-info">
                        <h2 className="profile-name">{user.name || user.username}</h2>
                        <p className="username-text"><strong>@{user.username}</strong></p>
                        {isOwnProfile && user.email && (
                            <p className="email-text">{user.email}</p>
                        )}
                        <p>{user.bio || "Farmer at FarmConnect"}</p>
                        <p>🌍 {user.farmLocation || "India"}</p>
                        <div className="connection-stats">
                            <span className="clickable" onClick={handleFollowersClick}>
                                <span className="followers-icon">👥</span> {user.followers || 0} followers
                            </span>
                            <span className="separator">|</span>
                            <span className="clickable" onClick={handleFollowingClick}>
                                {user.following || 0} following
                            </span>
                        </div>
                        {!isOwnProfile && (
                            <button className={isFollowing ? "unfollow-btn" : "follow-btn"} onClick={toggleFollow}>
                                {isFollowing ? "Unfollow" : "Follow"}
                            </button>
                        )}
                    </div>
                </div>

                <div className="Social-profile-posts">
                    {user.posts && user.posts.length > 0 ? (
                        // Filter out any posts that might be marked as deleted but weren't caught by the backend
                        (() => {
                            const filteredPosts = user.posts.filter(
                                post => !post.deleted && post.caption && (post.image || post.content)
                            );
                            
                            // If no posts left after filtering, show "no posts" message
                            if (filteredPosts.length === 0) {
                                return (
                                    <div className="no-posts-message">
                                        <p>No posts yet</p>
                                        {isOwnProfile && (
                                            <Link to="/social/new-post" className="create-post-btn">Create your first post</Link>
                                        )}
                                    </div>
                                );
                            }
                            
                            // Otherwise, render the filtered posts
                            return filteredPosts.map((post) => (
                                <div key={post._id || post.id} className="social-post-card">
                                    <img 
                                        src={post.image} 
                                        alt="Post" 
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "/default-post.jpg";
                                        }}
                                    />
                                    <p>{post.caption}</p>
                                    <div className="post-meta">
                                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                        <span>{Array.isArray(post.likes) ? post.likes.length : (post.likes || 0)} likes</span>
                                    </div>
                                </div>
                            ));
                        })()
                    ) : (
                        <div className="no-posts-message">
                            <p>No posts yet</p>
                            {isOwnProfile && (
                                <Link to="/social/new-post" className="create-post-btn">Create your first post</Link>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Followers Modal */}
            {showFollowersModal && (
                <div className="modal">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Followers</h3>
                            <button onClick={() => setShowFollowersModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            {loadingConnections ? (
                                <div className="loading-connections">Loading followers...</div>
                            ) : followers.length > 0 ? (
                                <ul className="connections-list">
                                    {followers.map(follower => (
                                        <li key={follower._id || `follower-${Math.random()}`} className="connection-item">
                                            <img 
                                                src={follower.avatar || "/1.png"} 
                                                alt="Follower" 
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = "/1.png";
                                                }}
                                            />
                                            <div className="connection-info">
                                                <span className="connection-name" 
                                                    onClick={() => handleUserClick(follower.username || follower.name)}
                                                >
                                                    {follower.username || follower.name || "User"}
                                                </span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="no-connections">No followers yet</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Following Modal */}
            {showFollowingModal && (
                <div className="modal">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Following</h3>
                            <button onClick={() => setShowFollowingModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            {loadingConnections ? (
                                <div className="loading-connections">Loading following...</div>
                            ) : following.length > 0 ? (
                                <ul className="connections-list">
                                    {following.map(follow => (
                                        <li key={follow._id || `following-${Math.random()}`} className="connection-item">
                                            <img 
                                                src={follow.avatar || "/1.png"} 
                                                alt="Following"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = "/1.png";
                                                }}
                                            />
                                            <div className="connection-info">
                                                <span className="connection-name" 
                                                    onClick={() => handleUserClick(follow.username || follow.name)}
                                                >
                                                    {follow.username || follow.name || "User"}
                                                </span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="no-connections">Not following anyone yet</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
