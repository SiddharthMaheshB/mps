import TextReveal from "./TextReveal";
import Background from "/1.png"
import Pic1 from "/3.jpg"
import Pic2 from "../frontimages/1.jpg";
import Pic3 from "../frontimages/3.jpg";
import Pic4 from "../frontimages/4.jpg";
import Pic5 from "../frontimages/5.jpg";
import "./TextReveal.css"
import { useState,useRef } from "react";
import Footer from "./Footer";
import { useOutletContext } from "react-router-dom";

const text = "The future of farming is smart sustainable, and limitless";
const words = text.split(" ");


 function Home(props){
  
 
  const {featuresRef,footerRef} = useOutletContext();
 
   const myStyle = {
      padding:0,
      top:0,
      left:0,
      backgroundImage : `url(${Background})`,
      height: "100vh",
      width: "100%",
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
      boxSizing: "border-box",
    }
  if(props.login)return(
    <div>
      <h1>After Login</h1>
    </div>
  )
  const hstyle={
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    color: "white",
    textAlign: "center",
    fontSize: "2rem",
    maxWidth: "90%",
    textTransform:"uppercase",
    textShadow:"2px 3px 3px black",
    animation: "fadeIn 3s ease-in-out",
   
  }
  const strings = [
    "AI-Powered Crop Analysis - Detects pests, diseases, and soil deficiencies using machine learning for smarter farming.",
    "Organic Fertilizer & Pesticide Suggestions - Recommends eco-friendly solutions to maintain soil health and sustainability.",
    "Real-time Soil & Weather Monitoring - Tracks soil fertility (NPK), pH, moisture, and temperature to optimize crop growth.",
    "Farmer Education & Guidance - Provides insights on organic farming techniques to enhance productivity and sustainability.",
   /* "Precision Farming Recommendations - Helps farmers choose the right crops based on soil conditions and climate data.",
    "Smart Pest & Disease Detection - Identifies crop diseases early, reducing losses and improving yields.",
    " Data-Driven Decision Making - Uses LSTM models to analyze agricultural data and enhance farm management.",
    "Sustainable Yield Optimization - Ensures maximum productivity with minimal environmental impact.",
    "Predictive Analysis for Crop Planning - Forecasts the best planting and harvesting times based on data trends.",
    "Global Accessibility for Farmers - A user-friendly platform designed to help farmers worldwide with AI-driven solutions.",*/
  ]
  const images = [Pic2,Pic3,Pic4,Pic5]
  const [pos,setPos] = useState(false)
  return (
    <>
    <div style={myStyle}>
      <h1 className="heading">
        {words.map((word, index) => (
          <span key={index} className="word" style={{ animationDelay: `${index * 0.09}s` }}>
            {word}
          </span>
        ))}
      </h1>
    </div>
        <div ref={featuresRef} id = "features">
    <TextReveal text={"Global Accessibility for Farmers - A user-friendly platform designed to help farmers worldwide with AI-driven solutions."} ClassName={"desc"} imageUrl={Pic1} imagePos="left"/>
    {strings.map((element, index) => {
      const currentPos = index % 2 === 0 ? "right" : "left"; 
      return (
        <TextReveal key={index} text={element} ClassName={"desc"} imageUrl={images[index]} imagePos={currentPos} />
      );
    })}
    </div>
    <br/>
    <br/>
    <br/>
    <div ref={footerRef}>
    <Footer id="footer"/>
    </div>
    </>
  )
}


export default Home