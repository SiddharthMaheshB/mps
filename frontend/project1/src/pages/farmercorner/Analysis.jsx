import "./common.css"
import "./section2.css"
import {useState,useEffect} from "react"
import {buildStyles,CircularProgressbarWithChildren} from "react-circular-progressbar"
import "react-circular-progressbar/dist/styles.css"
const Analysis = ({severity,pesticide,confidence,image=null,crop ="paddy"})=>{
    const [aniSeverity,setAniSeverity] = useState(0);
    useEffect(()=>{
        const ti = setTimeout(()=>setAniSeverity(severity),300);
        return ()=>clearTimeout(ti);
    },[aniSeverity]);
    const getcolor = (value)=>{
        if(value<40)return "#00c853";
        if(value<70) return "#FFD600";
        return "#D50000";
    }
    const getcolor2 = (value)=>{
        if(value<40)return "#D50000";
        if(value<70) return "#FFD600";
        return "#00c853";
    }
    return(
        <>
            <h4 className="inputheading">Analysis & Severity</h4>
            <div className="g-container">
                <CircularProgressbarWithChildren
                className="circularone"
                value={aniSeverity}
                maxValue={100}
                styles={buildStyles(
                    {
                        pathColor:getcolor(aniSeverity),
                        trailColor:"#e0e0e0",
                        strokeLinecap:"round",
                        
                        pathTransitionDuration:1.5,
                    }
                )}
                >
                    <div className="g-label">{aniSeverity}%-{aniSeverity>70?"High-Risk":aniSeverity>40?"Moderate-Risk":"Safe"}</div>
                </CircularProgressbarWithChildren>
            </div>
            <div className="detail-container">
                <p>Crop: <strong>{crop}</strong></p>
                <p>Detected: <strong>{pesticide}</strong></p>
                <div className="confidence-bar">
                    <div 
                        className="confidence-fill" 
                        style={{ 
                        width: `${Math.min(confidence, 100)}%`,  // Prevents overflow
                        background: getcolor2(confidence) 
                        }}
                    ></div>
                </div>

                <p>Confidence: {confidence}%</p>
            </div>
            {image && (
        <div className="image-preview">
            <h4>Result:</h4>
          <img src={image} alt="Detected" className="preview-img" />
        </div>
      )}
        </>
    )
}

export default Analysis