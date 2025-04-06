import { useState } from "react";
import "./NewPost.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function NewSocialPost() {
    const [caption, setCaption] = useState("");
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    
    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        if (!caption.trim()) {
            setError("Please enter some text for your post");
            return;
        }
        
        try {
            setLoading(true);
            setError("");
            
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Please log in to create a post');
            }
            
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            };
            
            const postData = {
                caption,
                image
            };
            
            const response = await axios.post(
                'http://localhost:5000/api/social/posts',
                postData,
                config
            );
            
            console.log("Post created successfully:", response.data);
            
            // Redirect to social feed page
            navigate('/social');
            
        } catch (err) {
            console.error("Error creating post:", err);
            setError(err.response?.data?.message || "Failed to create post. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="new-social-container">
            <h2 className="new-social-title">Create New Post</h2>
            {error && <div className="new-social-error">{error}</div>}
            <textarea 
                className="new-social-textarea" 
                placeholder="What's on your mind?" 
                value={caption} 
                onChange={(e) => setCaption(e.target.value)}
                required
            />
            <input 
                type="file" 
                accept="image/*" 
                className="new-social-file-input" 
                onChange={handleImageChange} 
            />
            {image && <img src={image} alt="Preview" className="new-social-image-preview" />}
            <button 
                className="new-social-submit" 
                onClick={handleSubmit}
                disabled={loading}
            >
                {loading ? "Posting..." : "Post"}
            </button>
        </div>
    );
}