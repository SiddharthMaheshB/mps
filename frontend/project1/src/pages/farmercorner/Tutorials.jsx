import "./Tutorial.css"
export default function Tutorials({login}){
    if(!login){
        return(
            <>
            <h1>404 Not Found!!</h1>
            </>
        )
    }
    return(
        <>
      
      <div className="container">
            <div className="header">
                <h2>Farmers' Learning Hub</h2>
                <input 
                    type="text" 
                    className="search-bar" 
                    placeholder="Search tutorials..."
                />
            </div>
            <div className="categories">
                {["Soil Health", "Pest Control", "Irrigation", "Fertilization", "Equipment"].map((category, index) => (
                    <div key={index} className="category">
                        {category}
                    </div>
                ))}
            </div>
            <div className="tutorial-content">
                <h2 className="tutorial-title">How to Improve Soil Quality</h2>
                <video className="tutorial-video" controls>
                    <source src="tutorial-video.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
                <p>This tutorial will guide you through the best practices for maintaining and improving soil health for better crop yield.</p>
            </div>
            <div className="footer">
                &copy; 2025 Smart Farming Solutions
            </div>
        </div>



        </>
    )
}