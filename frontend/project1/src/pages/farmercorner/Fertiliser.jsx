import "./common.css"
import FileUploader from "./FileUploader"
import FertilizerResults from "./FertiliserResults"
import FertilizerRec from "./FertiliserRecommendations"
import IExa from "/images.jpg"
import { useState, useEffect } from "react";

export default function Fertiliser({ login }) {
  const fallbackData = {
    name: "urea",
    npkRatio: "80-60-30",
    soilHealth: "70",
    npk: {
      n: "20",
      p: "30",
      k: "40"
    }
  };

  const fallbackReco = {
    fertilizer: {
      name: "Urea",
      image: IExa,
    },
    dosage: "Apply 50kg per hectare before irrigation.",
    bestPractices: "Mix with soil properly and avoid direct contact with plant roots.",
    warnings: "Excessive use may lead to soil acidification.",
    trendsData: [
      { date: "Jan", value: 30 },
      { date: "Feb", value: 45 },
      { date: "Mar", value: 50 },
      { date: "Apr", value: 50 },
      { date: "May", value: 50 },
    ],
    nutrientImbalance: [
      { nutrient: "Nitrogen", value: 80 },
      { nutrient: "Phosphorus", value: 40 },
      { nutrient: "Potassium", value: 60 },
    ],
    seasonalRequirements: [
      { season: "Spring", requirement: 50 },
      { season: "Summer", requirement: 80 },
      { season: "Autumn", requirement: 40 },
      { season: "Winter", requirement: 30 },
    ],
    nutrientDistribution: [
      { name: "Nitrogen", value: 50 },
      { name: "Phosphorus", value: 30 },
      { name: "Potassium", value: 20 },
    ],
  };

  const [analysisData, setAnalysisData] = useState(null);
  const [recommendationData, setRecommendationData] = useState(null);

  useEffect(() => {
    const isValid = analysisData?.recommended_fertilizer &&
                    analysisData?.nitrogen !== undefined &&
                    analysisData?.phosphorus !== undefined &&
                    analysisData?.potassium !== undefined;
  
    if (!isValid) return;
  
    const fetchData = async () => {
      try {
        const fertrec = await fetch(`http://localhost:8000/api/fertiliser/recommendation`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fertilizer: analysisData.recommended_fertilizer,
            nitrogen: parseFloat(analysisData.nitrogen),
            phosphorus: parseFloat(analysisData.phosphorus),
            potassium: parseFloat(analysisData.potassium),
          }),
        });
  
        const recoJson = await fertrec.json();
        if (recoJson && Object.keys(recoJson).length > 0) {
          setRecommendationData(recoJson);
        }
      } catch (error) {
        console.error("API fetch failed, using fallback data.", error);
      }
    };
  
    fetchData();
  }, [analysisData]);
  
  

  const finalAnalysis = analysisData && analysisData.nitrogen !== undefined
  ? {
      ...analysisData,
      soilHealth: (
        (parseFloat(analysisData.nitrogen || 0) +
         parseFloat(analysisData.phosphorus || 0) +
         parseFloat(analysisData.potassium || 0)) / 3
      ).toFixed(2),
      npk: {
        n: analysisData.nitrogen,
        p: analysisData.phosphorus,
        k: analysisData.potassium,
      }
    }
  : fallbackData;

  const finalReco = recommendationData|| fallbackReco

  if (!login) {
    return <h1>404 Not Found!!</h1>;
  }

  return (
    <>
      <div className="section-container">
        <div className="section1">
        <FileUploader onDetect={(data) => setAnalysisData({ ...data })} />
        </div>
        <div className="section2">
          <FertilizerResults soilHealth={finalAnalysis.soilHealth} npk={finalAnalysis.npk} />
        </div>
        <div className="section3">
          <FertilizerRec recommendations={finalReco} />
        </div>
      </div>
      <br />
      <br />
      <br />
    </>
  );
}
