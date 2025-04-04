import "./common.css";
import FileUploader1 from "./FileUploader1";
import CroprecResults from "./CroprecResults";
import CropRec from "./Crop";
import IExa from "/5.jpg";

export default function CropRecommendation({ login }) {
  const data = {
    soilHealth: "80",
    moistureLevel: "60",
    phLevel: "6.5",
    temperature: "25",
  };

  const sampleData = {
    bestCrops: ["Wheat", "Rice", "Maize"],
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

  if (!login) {
    return <h1>404 Not Found!!</h1>;
  }

  return (
    <>
      <div className="section-container">
        <div className="section1">
          <FileUploader1 />
        </div>
        <div className="section2">
          <CroprecResults {...data} />
        </div>
        <div className="section3">
          <CropRec recommendations={sampleData} />
        </div>
      </div> 
      <br />
      <br />
    </>
  );
}
