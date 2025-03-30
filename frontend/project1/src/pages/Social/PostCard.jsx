import React, { useState } from "react";
import "./Postcard.css";
import { Link } from "react-router-dom";
const PostCard = ({ post, friends, onShare }) => {
    const [likes, setLikes] = useState(post.likes);
    const [liked, setLiked] = useState(false);
    const [showShare, setShowShare] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [comments, setComments] = useState(post.comments || []);
    const [selectedFriends, setSelectedFriends] = useState([]);

    // Handle Like
    const handleLike = () => {
        setLikes(liked ? likes - 1 : likes + 1);
        setLiked(!liked);
    };

    // Toggle Share Menu
    const handleShare = () => {
        setShowShare(!showShare);
    };

    // Toggle Comments Section
    const toggleComments = () => {
        setShowComments(!showComments);
    };

    // Handle Comment Submission
    const handleCommentSubmit = (e) => {
        e.preventDefault();
        if (newComment.trim()) {
            setComments([...comments, { user: "You", text: newComment }]);
            setNewComment("");
        }
    };

    // Handle Friend Selection for In-App Sharing
    const handleFriendSelection = (friend) => {
        setSelectedFriends((prev) =>
            prev.includes(friend)
                ? prev.filter((f) => f !== friend)
                : [...prev, friend]
        );
    };

    // Handle Sharing the Post Within the App
    const sharePost = () => {
        onShare(post.id, selectedFriends);
        setShowShare(false);
        setSelectedFriends([]); // Clear selection after sharing
    };

    // Handle External Sharing
    const shareOnSocial = (platform) => {
        const postUrl = window.location.origin + "/post/" + post.id;
        if (platform === "whatsapp") {
            window.open(`https://wa.me/?text=Check%20this%20out!%20${postUrl}`, "_blank");
        } else if (platform === "facebook") {
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${postUrl}`, "_blank");
        } else if (platform === "twitter") {
            window.open(`https://twitter.com/intent/tweet?url=${postUrl}&text=Check%20this%20farm%20update!`, "_blank");
        } else if (platform === "copy") {
            navigator.clipboard.writeText(postUrl);
            alert("Link copied to clipboard!");
        }
    };

    return (
        <div className="post-card">
            <div className="post-header">
                <img src={post.userImage} alt="User" className="user-img" />
                <span className="username"> <Link to={`/profile/${post.username}`}>{post.username}</Link></span>
            </div>

            <img src={post.image} alt="Post" className="post-img" />

            <div className="post-actions">
                <button onClick={handleLike}>
                    {liked ? "❤️" : "🤍"} {likes}
                </button>
                <button onClick={handleShare}>🔗 Share</button>
                <button onClick={toggleComments}>💬 {comments.length} Comments</button>
            </div>

            {/* Share Menu */}
            {showShare && (
                <div className="share-options">
                    <h4>Share Post:</h4>

                    {/* In-App Sharing */}
                    <div className="in-app-sharing">
                        <h5>Share with Friends:</h5>
                        {friends.map((friend) => (
                            <label key={friend.id} className="friend-option">
                                <input
                                    type="checkbox"
                                    checked={selectedFriends.includes(friend)}
                                    onChange={() => handleFriendSelection(friend)}
                                />
                                {friend.name}
                            </label>
                        ))}
                        <button className="share-btn" onClick={sharePost}>Share in App</button>
                    </div>

                    {/* External Sharing */}
                    <div className="external-sharing">
                        <h5>Share Externally:</h5>
                        <button onClick={() => shareOnSocial("whatsapp")}>📲 WhatsApp</button>
                        <button onClick={() => shareOnSocial("facebook")}>📘 Facebook</button>
                        <button onClick={() => shareOnSocial("twitter")}>🐦 Twitter</button>
                        <button onClick={() => shareOnSocial("copy")}>📋 Copy Link</button>
                    </div>
                </div>
            )}

            {/* Comments Section */}
            {showComments && (
                <div className="comments-section">
                    <h4>Comments:</h4>
                    {comments.map((comment, index) => (
                        <p key={index}><b>{comment.user}</b>: {comment.text}</p>
                    ))}
                    <form onSubmit={handleCommentSubmit}>
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write a comment..."
                        />
                        <button type="submit">Post</button>
                    </form>
                </div>
            )}

            <p className="caption"><b>{post.username}</b> {post.caption}</p>
        </div>
    );
};

export default PostCard;
