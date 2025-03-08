import "./common.css"
import ImageUploader from "./Imageuploader"
import Analysis from "./Analysis"
import Recommendations from "./Recommendations"
import image from "/4.jpg"

export default function Pest({login}){
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
        <h4 className="inputheading">Upload an Image for Pest Detection</h4>
            <ImageUploader buttonname={"Detect Pest-Disease"}/>
        </div>
        <div className="section2">
            <Analysis severity={60} pesticide={"musk"} confidence={70} image={image} />
        </div>
        <div className="section3">
            <Recommendations detectedPesticide={"musk"}/>
        </div>
        </div>
        <br/>
        <br/>
        <br/>
        
        </>
    )
}