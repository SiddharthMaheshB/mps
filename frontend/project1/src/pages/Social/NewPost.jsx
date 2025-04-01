import { useState } from "react";
import "./NewPost.css";

export default function NewSocialPost() {
    const [text, setText] = useState("");
    const [image, setImage] = useState(null);
    
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

    const handleSubmit = (event) => {
        event.preventDefault();
        console.log("Post submitted:", { text, image });
        // Handle post submission logic
    };

    return (
        <div className="new-social-container">
            <h2 className="new-social-title">Create New Post</h2>
            <textarea 
                className="new-social-textarea" 
                placeholder="What's on your mind?" 
                value={text} 
                onChange={(e) => setText(e.target.value)}
            />
            <input 
                type="file" 
                accept="image/*" 
                className="new-social-file-input" 
                onChange={handleImageChange} 
            />
            {image && <img src={image} alt="Preview" className="new-social-image-preview" />}
            <button className="new-social-submit" onClick={handleSubmit}>Post</button>
        </div>
    );
}