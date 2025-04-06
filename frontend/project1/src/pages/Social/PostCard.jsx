import React, { useState, useEffect } from "react";
import "./Postcard.css";
import { Link } from "react-router-dom";
import { Heart, HeartOff, Share2, MessageCircle, Copy, User, Users, Share, AlertTriangle } from "lucide-react";
import { FaFacebook, FaTwitter, FaWhatsapp, FaLinkedin } from "react-icons/fa";

const PostCard = ({ post, connections = [], onLike, onComment, onShare, showSharer = false }) => {
    // Check if the post has any displayable content
    const isMissingContent = !post || 
        ((!post.caption || post.caption.trim() === '') && 
        (!post.image || post.image.trim() === '') && 
        (!post.content || post.content.trim() === ''));
    
    // If post is missing content, show a simplified card
    if (isMissingContent) {
        return (
            <div className="post-card deleted-post-card">
                <div className="deleted-post-header">
                    <AlertTriangle size={20} color="#d32f2f" />
                    <h3>This post is no longer available</h3>
                </div>
                <p>The content may have been removed by the creator.</p>
                {showSharer && post.sharedBy && post.sharedBy.length > 0 && post.sharedBy[0].sharerUsername && (
                    <p>Originally shared by: <Link to={`/social/profile/${post.sharedBy[0].sharerUsername}`}>{post.sharedBy[0].sharerUsername}</Link></p>
                )}
            </div>
        );
    }
    
    // Calculate likes display - support both formats (API and dummy)
    const likesCount = Array.isArray(post.likes) 
        ? post.likes.length 
        : (typeof post.likes === 'number' ? post.likes : 0);
    
    // Check if user has liked the post
    const [liked, setLiked] = useState(post.isLiked || false);
    const [localLikesCount, setLocalLikesCount] = useState(likesCount);
    
    const [showShare, setShowShare] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [comments, setComments] = useState(post.comments || []);
    const [selectedConnections, setSelectedConnections] = useState([]);
    const [copySuccess, setCopySuccess] = useState(false);

    // Check if this post was shared with the current user
    const isSharedPost = post.sharedBy && post.sharedBy.length > 0;
    
    // Get the username and avatar of the person who shared this post (most recent share)
    const getSharerInfo = () => {
        if (!isSharedPost) return { username: null, avatar: null };
        
        try {
            // Sort shares by timestamp (newest first) to get the most recent sharer
            const sortedShares = [...post.sharedBy].sort((a, b) => 
                new Date(b.timestamp || 0) - new Date(a.timestamp || 0)
            );
            
            let sharerUsername = null;
            let sharerAvatar = null;
            
            // First try to get the username from the sharer info
            if (sortedShares[0]) {
                // If sharerUsername is directly available, use it
                if (sortedShares[0].sharerUsername) {
                    sharerUsername = sortedShares[0].sharerUsername;
                }
                
                // If sharerAvatar is directly available, use it
                if (sortedShares[0].sharerAvatar) {
                    sharerAvatar = sortedShares[0].sharerAvatar;
                }
                
                // If user object is available with username property
                if (sortedShares[0].user && typeof sortedShares[0].user === 'object') {
                    if (sortedShares[0].user.username) {
                        sharerUsername = sortedShares[0].user.username;
                    }
                    if (sortedShares[0].user.avatar || sortedShares[0].user.profilePic) {
                        sharerAvatar = sortedShares[0].user.avatar || sortedShares[0].user.profilePic;
                    }
                }
                
                // If user is just a string ID, we need to find the username in another way
                // For now, check if there's a cached username in localStorage matching this user ID
                const currentUserData = JSON.parse(localStorage.getItem('user') || '{}');
                if (sortedShares[0].user && currentUserData._id === sortedShares[0].user) {
                    sharerUsername = currentUserData.username;
                    sharerAvatar = currentUserData.avatar;
                }
            }
            
            return { username: sharerUsername, avatar: sharerAvatar };
        } catch (err) {
            console.error("Error extracting sharer info:", err);
            return { username: null, avatar: null };
        }
    };
    
    const { username: sharerUsername, avatar: sharerAvatar } = getSharerInfo();

    // Update local state when post prop changes
    useEffect(() => {
        // Update likes count when post changes
        const newLikesCount = Array.isArray(post.likes) 
            ? post.likes.length 
            : (typeof post.likes === 'number' ? post.likes : 0);
        
        setLocalLikesCount(newLikesCount);
        setLiked(post.isLiked || false);
        setComments(post.comments || []);
    }, [post]);

    // Reset selected connections when connections prop changes
    useEffect(() => {
        setSelectedConnections([]);
    }, [connections]);

    // Handle like button click
    const handleLike = () => {
        // Call the parent handler to update backend
        onLike(post._id || post.id);
        
        // Update local state immediately for UI responsiveness
        setLiked(!liked);
        setLocalLikesCount(liked ? localLikesCount - 1 : localLikesCount + 1);
    };

    const handleShare = () => {
        setShowShare(!showShare);
        if (!showShare) {
            setSelectedConnections([]); // Reset selections when opening
        }
    };

    const toggleComments = () => {
        setShowComments(!showComments);
    };

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        if (newComment.trim()) {
            // Add comment to local state immediately for UI responsiveness
            const newCommentObj = { user: "You", text: newComment };
            setComments([...comments, newCommentObj]);
            
            // Call the parent handler to update backend
            onComment(post._id || post.id, newComment);
            
            // Clear the input
            setNewComment("");
        }
    };

    const handleConnectionSelection = (connection) => {
        setSelectedConnections((prev) =>
            prev.includes(connection)
                ? prev.filter((c) => c.id !== connection.id)
                : [...prev, connection]
        );
    };

    const sharePost = () => {
        // Call the parent handler to update backend
        onShare(post._id || post.id, selectedConnections);
        
        // Reset UI state
        setShowShare(false);
        setSelectedConnections([]);
    };

    const postUrl = `${window.location.origin}/post/${post._id || post.id}`;
    const shareTitle = `Check out this farm update from ${post.username}!`;
    const shareText = post.caption ? `${shareTitle} - "${post.caption.substring(0, 100)}${post.caption.length > 100 ? '...' : ''}"` : shareTitle;
    
    const shareOnSocial = (platform) => {
        let shareUrl = "";

        switch(platform) {
            case "whatsapp":
                shareUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + postUrl)}`;
                break;
            case "facebook":
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}&quote=${encodeURIComponent(shareText)}`;
                break;
            case "twitter":
                shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(shareText)}`;
                break;
            case "linkedin":
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`;
                break;
            case "copy":
                navigator.clipboard.writeText(postUrl).then(() => {
                    setCopySuccess(true);
                    setTimeout(() => setCopySuccess(false), 2000);
                });
                return;
            default:
                return;
        }

        window.open(shareUrl, "_blank", "noopener,noreferrer");
    };

    return (
        <div className="post-card">
            {showSharer && sharerUsername && (
                <div className="shared-by-info">
                    <img 
                        src={sharerAvatar || "/1.png"} 
                        alt="Sharer" 
                        className="sharer-img" 
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/1.png";
                        }}
                    />
                    <Share size={14} />
                    <span>Shared by: <Link to={`/social/profile/${sharerUsername}`}>{sharerUsername}</Link></span>
                </div>
            )}
            
            <div className="post-header">
                <img 
                    src={post.userImage || "/1.png"} 
                    alt="User" 
                    className="user-img" 
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/1.png";
                    }}
                />
                <span className="username">
                    <Link to={`/social/profile/${post.username}`}>
                        {post.username}
                    </Link>
                </span>
            </div>

            <div className="post-content">
                {post.caption && <p className="post-caption">{post.caption}</p>}
                {post.image ? (
                    <img 
                        src={post.image} 
                        alt="Post" 
                        className="post-img" 
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/default-post.jpg";
                        }}
                    />
                ) : (
                    post.content && <div className="post-text-content">{post.content}</div>
                )}
            </div>

            <div className="post-actions">
                <button onClick={handleLike} className={`action-btn ${liked ? 'liked' : ''}`}>
                    {liked ? <Heart color="red" fill="red" /> : <HeartOff />} 
                    <span>{localLikesCount}</span>
                </button>
                <button onClick={toggleComments} className="action-btn">
                    <MessageCircle /> 
                    <span>{comments.length} Comments</span>
                </button>
                <button onClick={handleShare} className="action-btn">
                    <Share2 /> 
                    <span>Share</span>
                </button>
            </div>

            {showShare && (
                <div className="share-options">
                    <div className="share-header">
                        <h4>Share Post</h4>
                        <button className="close-btn" onClick={() => setShowShare(false)}>×</button>
                    </div>
                    
                    <div className="in-app-sharing">
                        <h5><Users size={14} /> Share with My Followers ({connections.length})</h5>

                        {connections.length > 0 ? (
                            <>
                                <div className="connection-list">
                                    {connections.map((connection) => (
                                        <label key={connection.id} className="connection-option">
                                            <input
                                                type="checkbox"
                                                checked={selectedConnections.some(c => c.id === connection.id)}
                                                onChange={() => handleConnectionSelection(connection)}
                                            />
                                            <img 
                                                src={connection.avatar || "/1.png"} 
                                                alt={connection.name}
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = "/1.png";
                                                }}
                                            />
                                            <span>{connection.name}</span>
                                            <span className="connection-type">Follower</span>
                                        </label>
                                    ))}
                                </div>
                                {selectedConnections.length > 0 && (
                                    <div className="selection-summary">
                                        Selected: {selectedConnections.length} followers
                                    </div>
                                )}
                                <button 
                                    onClick={sharePost} 
                                    className="share-button"
                                    disabled={selectedConnections.length === 0}
                                >
                                    Share with Selected Followers
                                </button>
                            </>
                        ) : (
                            <div className="no-connections">
                                <User size={40} />
                                <p>No followers found</p>
                                <small>When others follow you, they'll appear here</small>
                            </div>
                        )}
                    </div>

                    <div className="external-sharing">
                        <h5>Share Externally:</h5>
                        <div className="social-share-buttons">
                            <button 
                                onClick={() => shareOnSocial("whatsapp")} 
                                className="social-share-btn whatsapp"
                            >
                                <FaWhatsapp size={18}/> WhatsApp
                            </button>
                            <button 
                                onClick={() => shareOnSocial("facebook")} 
                                className="social-share-btn facebook"
                            >
                                <FaFacebook size={18}/> Facebook
                            </button>
                            <button 
                                onClick={() => shareOnSocial("twitter")} 
                                className="social-share-btn twitter"
                            >
                                <FaTwitter size={18}/> Twitter
                            </button>
                            <button 
                                onClick={() => shareOnSocial("linkedin")} 
                                className="social-share-btn linkedin"
                            >
                                <FaLinkedin size={18}/> LinkedIn
                            </button>
                            <button 
                                onClick={() => shareOnSocial("copy")} 
                                className="social-share-btn copy"
                            >
                                <Copy size={16}/> {copySuccess ? "Copied!" : "Copy Link"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showComments && (
                <div className="comments-section">
                    <h4>Comments:</h4>
                    {comments.length > 0 ? (
                        <div className="comments-list">
                            {comments.map((comment, index) => (
                                <div key={index} className="comment-item">
                                    <strong>{comment.username || comment.user}</strong>: {comment.text}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="no-comments">No comments yet. Be the first to comment!</p>
                    )}
                    <form onSubmit={handleCommentSubmit} className="comment-form">
                        <input
                            type="text"
                            placeholder="Add a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="comment-input"
                        />
                        <button type="submit" className="comment-btn" disabled={!newComment.trim()}>
                            Post
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default PostCard;

