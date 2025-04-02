import React, { useState } from "react";
import "./Postcard.css";
import { Link } from "react-router-dom";
import { Heart, HeartOff, Share2, MessageCircle, Copy} from "lucide-react";
import { FaFacebook, FaTwitter, FaWhatsapp } from "react-icons/fa";
const PostCard = ({ post, friends, onShare }) => {
    const [likes, setLikes] = useState(post.likes);
    const [liked, setLiked] = useState(false);
    const [showShare, setShowShare] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [comments, setComments] = useState(post.comments || []);
    const [selectedFriends, setSelectedFriends] = useState([]);

    const handleLike = () => {
        setLikes(liked ? likes - 1 : likes + 1);
        setLiked(!liked);
    };

    const handleShare = () => {
        setShowShare(!showShare);
    };

    const toggleComments = () => {
        setShowComments(!showComments);
    };

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        if (newComment.trim()) {
            setComments([...comments, { user: "You", text: newComment }]);
            setNewComment("");
        }
    };

    const handleFriendSelection = (friend) => {
        setSelectedFriends((prev) =>
            prev.includes(friend)
                ? prev.filter((f) => f !== friend)
                : [...prev, friend]
        );
    };

    const sharePost = () => {
        onShare(post.id, selectedFriends);
        setShowShare(false);
        setSelectedFriends([]);
    };

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
                <span className="username"> <Link to={`/social/profile/${post.username}`} style={{textDecoration:"none"}}>{post.username}</Link></span>
            </div>

            <img src={post.image} alt="Post" className="post-img" />

            <div className="post-actions" style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '10px 0' }}>
                <button onClick={handleLike} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {liked ? <Heart color="red" /> : <HeartOff />} {likes}
                </button>
                <button onClick={toggleComments} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <MessageCircle /> {comments.length} Comments
                </button>
                <button onClick={handleShare} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Share2 /> Share
                </button>
            </div>

            {showShare && (
                <div className="share-options">
                    <h4>Share Post:</h4>
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
                        
                    </div>

                    <div className="external-sharing">
                        <h5>Share Externally:</h5>
                        <button onClick={() => shareOnSocial("whatsapp")} ><FaWhatsapp/> WhatsApp</button>
                        <button onClick={() => shareOnSocial("facebook")}><FaFacebook /> Facebook</button>
                        <button onClick={() => shareOnSocial("twitter")}><FaTwitter /> Twitter</button>
                        <button onClick={() => shareOnSocial("copy")}><Copy size={15}/> Copy Link</button>
                    </div>
                </div>
            )}

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

