import "./common.css";
import FileUploader1 from "./FileUploader1";
import CroprecResults from "./CroprecResults";
import CropRec from "./Crop";
import IExa from "/5.jpg";
import { useState, useEffect } from "react";

export default function CropRecommendation({ login }) {
  const fallbackAnalysis = {
    recommended_crop:"paddy",
    soilHealth: "80",
    moistureLevel: "60",
    phLevel: "6.5",
    temperature: "25",
  };

  const fallbackReco = {
    bestCrops: ["Apple"],
    recommendations: [
      { crop: "Wheat", suitability: "High", icon: "🌾" },
      { crop: "Rice", suitability: "Moderate", icon: "🌱" },
      { crop: "Maize", suitability: "High", icon: "🌽" },
    ],
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
    const isValid = analysisData?.moistureLevel !== undefined &&
                    analysisData?.phLevel !== undefined &&
                    analysisData?.temperature !== undefined;

    if (!isValid) return;

    const fetchData = async () => {
      try {
        const cropRec = await fetch(`http://localhost:8000/api/croppred/recommendation`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            recommended_crop: `${analysisData.recommended_crop}`,
            moisture: parseFloat(analysisData.moistureLevel),
            ph: parseFloat(analysisData.phLevel),
            temperature: parseFloat(analysisData.temperature),
          }),
        });

        const recoJson = await cropRec.json();
        if (recoJson && Object.keys(recoJson).length > 0) {
          console.log(recoJson)
          setRecommendationData(recoJson);
        }
      } catch (error) {
        console.error("API fetch failed, using fallback recommendation data.", error);
      }
    };

    fetchData();
  }, [analysisData]);

  const finalAnalysis = analysisData || fallbackAnalysis;
  const finalReco = recommendationData || fallbackReco;

  if (!login) {
    return <h1>404 Not Found!!</h1>;
  }

  return (
    <>
      <div className="section-container">
        <div className="section1">
          <FileUploader1 onDetect={(data) => setAnalysisData({ ...data })} />
        </div>
        <div className="section2">
          <CroprecResults {...finalAnalysis} />
        </div>
        <div className="section3">
          <CropRec recommendations={finalReco} />
        </div>
      </div>
      <br />
      <br />
    </>
  );
}
