import { useState } from "react";
import "./Tutorial.css";

const tutorialsList = [
  {
    title: "How to Improve Soil Quality",
    video: "tutorial-video.mp4",
    description: "Best practices for maintaining and improving soil health.",
    category: "Soil Health",
  },
  {
    title: "Effective Pest Management",
    video: "tutorial-video.mp4",
    description: "Learn how to control pests organically and safely.",
    category: "Pest Control",
  },
  {
    title: "Smart Irrigation Techniques",
    video: "tutorial-video.mp4",
    description: "Optimize water usage with smart irrigation.",
    category: "Irrigation",
  },
  {
    title: "Balanced Fertilization Tips",
    video: "tutorial-video.mp4",
    description: "Guide to choosing and applying fertilizers effectively.",
    category: "Fertilization",
  },
  {
    title: "Using Modern Farm Equipment",
    video: "tutorial-video.mp4",
    description: "Intro to handling and maintaining equipment.",
    category: "Equipment",
  },
];

export default function Tutorials({ login }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  if (!login) {
    return <h1>404 Not Found!!</h1>;
  }

  const filteredTutorials = tutorialsList.filter((tutorial) => {
    const matchesCategory =
      !selectedCategory || tutorial.category === selectedCategory;
    const matchesSearch =
      tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutorial.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleCategoryClick = (category) => {
    setSelectedCategory((prev) => (prev === category ? "" : category)); // toggle
  };

  return (
    <div className="container">
      <div className="header">
        <h2>Farmers' Learning Hub</h2>
        <input
          type="text"
          className="search-bar"
          placeholder="Search tutorials..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="categories">
        {["Soil Health", "Pest Control", "Irrigation", "Fertilization", "Equipment"].map(
          (category, index) => (
            <div
              key={index}
              className={`category ${
                selectedCategory === category ? "active-category" : ""
              }`}
              onClick={() => handleCategoryClick(category)}
            >
              {category}
            </div>
          )
        )}
      </div>

      <div className="video-container">
        {filteredTutorials.length > 0 ? (
          filteredTutorials.map((tutorial, index) => (
            <div key={index} className="tutorial-content">
              <h2 className="tutorial-title">{tutorial.title}</h2>
              <video className="tutorial-video" controls>
                <source src={tutorial.video} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <p>{tutorial.description}</p>
            </div>
          ))
        ) : (
          <p style={{ textAlign: "center", marginTop: "2rem" }}>
            No tutorials found.
          </p>
        )}
      </div>

      <div className="footer">&copy; 2025 Smart Farming Solutions</div>
    </div>
  );
}
