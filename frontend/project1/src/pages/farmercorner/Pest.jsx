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
      
          "disease": "Powdery Mildew (Erysiphe spp.)",
          "remedies": [
            {
              "remedy_type": "Chemical Treatment",
              "description": "Apply systemic fungicides such as triadimefon or myclobutanil when symptoms first appear. Repeat applications every 10-14 days as per label instructions.",
              "dosage": "Use 1-2 ml of fungicide per liter of water, depending on the product. Always follow the manufacturer's guidelines."
            },
            {
              "remedy_type": "Organic Treatment",
              "description": "Spray with a mixture of baking soda (sodium bicarbonate) and water, optionally with a bit of horticultural oil to increase effectiveness. Apply weekly during high humidity periods.",
              "dosage": "Mix 1 tablespoon of baking soda and 1 teaspoon of horticultural oil in 1 liter of water."
            }
          ]
        
        
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
        if (!analysisData?.crop || !analysisData?.disease) return;
        
        try {
          const crop = analysisData.crop.toLowerCase().replace(" ", "_");
          const disease = analysisData.disease.toLowerCase().replace(" ", "_");
          const recoRes = await fetch(`http://localhost:8000/api/recommendation/${crop}/${disease}`);

          
          const recoJson = await recoRes.json();
    
          if (recoJson && Object.keys(recoJson).length > 0) {
            setRecommendationData(recoJson);
          }
        } catch (error) {
          console.error("API fetch failed, using default data.");
        }
      };
    
      fetchData();
    }, [analysisData]);  
    

     
      const finalAnalysis = analysisData || {
        severity: 60,
        pesticide: "Powdery Mildew",
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