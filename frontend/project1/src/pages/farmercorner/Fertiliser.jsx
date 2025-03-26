import "./common.css"
import FileUploader from "./FileUploader"
import FertilizerResults from "./FertiliserResults"
import FertilizerRec from "./FertiliserRecommendations"
import IExa from "/images.jpg"
export default function Fertiliser({login}){
    const data={
        name:"urea",
        npkRatio:"80-60-30",
        soilHealth:"70",
        npk:{
            n:"20",
            p:"30",
            k:"40"
        }

    }
    const sampleData = {
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
    if(!login){
        return(
            <>
            <h1>404 Not Found!!</h1>
            </>
        )
    }
    return(
        <>
        <div className="section-container">
        <div className="section1">
        
        <FileUploader/>
        </div>
        <div className="section2">
            
            <FertilizerResults soilHealth={data.soilHealth} npk={data.npk}/>
        </div>
        <div className="section3">
           
            <FertilizerRec  recommendations={sampleData}/>
        </div>
        </div>
        <br/>
        <br/>
        <br/>
        
        </>
    )
}