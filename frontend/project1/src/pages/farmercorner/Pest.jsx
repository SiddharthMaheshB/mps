import "./common.css"
import ImageUploader from "./Imageuploader"
import Analysis from "./Analysis"
import Recommendations from "./Recommendations"
import image from "/4.jpg"
import { useState,useEffect } from "react"

export default function Pest({login}){
    const [analysisData, setAnalysisData] = useState(null);
    const [recommendationData, setRecommendationData] = useState(null);

  

    const reco = {
        musk: {
          remedy: "Neem oil spray is an effective and eco-friendly alternative for controlling musk pests.",
          dosage: "Mix 5ml of neem oil with 1 liter of water and spray on affected plants every 7 days.",
        },
        // Add more pesticides here...
      };
      
      const detec = [
        { date: "Jan", cases: 5 },
        { date: "Feb", cases: 9 },
        { date: "Mar", cases: 12 },
        { date: "Apr", cases: 7 },
        { date: "May", cases: 15 },
      ];
      
      const seas = [
        { season: "Spring", cases: 10 },
        { season: "Summer", cases: 20 },
        { season: "Autumn", cases: 8 },
        { season: "Winter", cases: 5 },
      ];
      
      const pestici = [
        { name: "Musk", value: 45 },
        { name: "Alpha", value: 25 },
        { name: "Beta", value: 30 },
      ];
      
      const COL = ["#0088FE", "#00C49F", "#FFBB28"];


    if(!login){
        return(
            <>
            <h1>404 Not Found!!</h1>
            </>
        )
    }

    useEffect(() => {
        const fetchData = async () => {
          try {
            
            const recoRes = await fetch("/api/recommendation");
    
            
            const recoJson = await recoRes.json();
    
            // Check if response has meaningful data
            
    
            if (recoJson && Object.keys(recoJson).length > 0) {
              setRecommendationData(recoJson);
            }
          } catch (error) {
            console.error("API fetch failed, using default data.");
          }
        };
    
        fetchData();
      }, []);

     
      const finalAnalysis = analysisData || {
        severity: 60,
        pesticide: "musk",
        confidence: 70,
        img: image,
      };
    
      const finalReco = recommendationData || reco;


    return(
        <>
      
        <div className="section-container">
        <div className="section1">
        <h4 className="inputheading">Upload an Image for Disease Detection</h4>
            <ImageUploader onDetect = {setAnalysisData} buttonname={"Detect Disease"}/>
        </div>
        <div className="section2">
            <Analysis severity={finalAnalysis.severity} crop = {finalAnalysis.crop} pesticide={finalAnalysis.pesticide} confidence={finalAnalysis.confidence} image={finalAnalysis.img} />
        </div>
        <div className="section3">
            <Recommendations detectedPesticide={finalAnalysis.pesticide} COLORS={COL} pesticideDistribution= {pestici} seasonalTrends={seas} detectionHistory={detec} recommendations ={finalReco}/>
        </div>
        </div>
        <br/>
        <br/>
        <br/>
        
        </>
    )
}