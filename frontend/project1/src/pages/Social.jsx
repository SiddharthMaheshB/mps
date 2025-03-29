import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import io from "socket.io-client";
import "./Social.css";

const socket = io("http://localhost:5000"); // Update with your backend URL

export default function FarmScene({ login }) {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [stories, setStories] = useState([]);
  const [newStory, setNewStory] = useState("");

  if (!login) {
    return <h1>404 Not Found</h1>;
  }

  useEffect(() => {
    // Listen for real-time post updates
    socket.on("newPost", (post) => {
      setPosts((prevPosts) => [post, ...prevPosts]);
    });

    // Listen for real-time story updates
    socket.on("newStory", (story) => {
      setStories((prevStories) => [story, ...prevStories]);
    });

    return () => {
      socket.off("newPost");
      socket.off("newStory");
    };
  }, []);

  const handlePostSubmit = () => {
    if (newPost.trim() !== "") {
      const post = {
        id: Date.now(),
        content: newPost,
        author: "John Doe", // Replace with actual user data
        time: new Date().toLocaleTimeString(),
      };
      socket.emit("createPost", post);
      setNewPost("");
    }
  };

  const handleStorySubmit = () => {
    if (newStory.trim() !== "") {
      const story = {
        id: Date.now(),
        content: newStory,
        author: "John Doe", // Replace with actual user data
      };
      socket.emit("createStory", story);
      setNewStory("");
    }
  };

  return (
    <div className="social-page">
      {/* Stories Section */}
      <div className="stories-container">
        <input
          type="text"
          placeholder="Share a short story..."
          value={newStory}
          onChange={(e) => setNewStory(e.target.value)}
        />
        <button onClick={handleStorySubmit}>Post Story</button>
        <div className="stories">
          {stories.map((story) => (
            <motion.div key={story.id} className="story-card">
              <p>{story.content}</p>
              <span>- {story.author}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* News Feed Section */}
      <div className="feed-container">
        <div className="post-input">
          <textarea
            placeholder="What's on your mind?"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
          />
          <button onClick={handlePostSubmit}>Post</button>
        </div>

        {/* Posts */}
        {posts.map((post) => (
          <motion.div key={post.id} className="post-card">
            <h3>{post.author}</h3>
            <p>{post.content}</p>
            <span>{post.time}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
