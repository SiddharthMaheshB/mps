import { useState,useEffect } from "react";
import "./section2.css"
import { CircularProgressbar,CircularProgressbarWithChildren,buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css"


const FertiliserResults = ({soilHealth, npk})=>{

  const [aniSoilHealth, setAniSoilHealth] = useState(0);
  const [animatedN, setAnimatedN] = useState(0);
  const [animatedP, setAnimatedP] = useState(0);
  const [animatedK, setAnimatedK] = useState(0);

  useEffect(() => {
    setTimeout(() => setAniSoilHealth(soilHealth), 300);
    setTimeout(() => setAnimatedN(npk.n), 400);
    setTimeout(() => setAnimatedP(npk.p), 500);
    setTimeout(() => setAnimatedK(npk.k), 600);
  }, [soilHealth, npk]);

  const getcolor = (value)=>{
    if(value<40)return "#D50000";
    if(value<70) return "#FFD600";
    return "#00c853";
  }
    return (
      
      <>
      <h4 className="inputheading">Fertiliser Analysis</h4>
      <div className="g-container">
        <h4 style={{marginTop:"0px"}}>Soil Health:</h4>
        <CircularProgressbarWithChildren
          className="circularone"
          value={aniSoilHealth}
          maxValue={100}
          styles={buildStyles({
            pathColor: getcolor(aniSoilHealth),
            trailColor:"#e0e0e0",
            strokeLinecap: "round",
            pathTransitionDuration: 1.5
          })}
        >
         
        <div className="g-label">{aniSoilHealth}%-{aniSoilHealth>=70?"Healthy ":aniSoilHealth>=40?"Moderate":"Poor"}</div>
        </CircularProgressbarWithChildren>
      </div>
      <div className="g-container">
      <h4>NPK Ratio:</h4>
        <div className="h-container">
          <CircularProgressbarWithChildren
              className="circulartwo"
              value={animatedN}
              maxValue={100}
              styles={buildStyles({
                pathColor: getcolor(animatedN),
                trailColor:"#e0e0e0",
                strokeLinecap: "round",
                pathTransitionDuration: 1.5
              })}
          >
          <div className="g-label">N: {animatedN}%</div>
          </CircularProgressbarWithChildren>
          
          <CircularProgressbarWithChildren
              className="circulartwo"
              value={animatedP}
              maxValue={100}
              styles={buildStyles({
                pathColor: getcolor(animatedP),
                trailColor:"#e0e0e0",
                strokeLinecap: "round",
                pathTransitionDuration: 1.5
                
              })}
          >
          <div className="g-label">P: {animatedP}%</div>
          </CircularProgressbarWithChildren>
        </div>
        <CircularProgressbarWithChildren
         className="circulartwo"
         value={animatedK}
         maxValue={100}
         styles={buildStyles({
           pathColor: getcolor(animatedK),
           trailColor:"#e0e0e0",
           strokeLinecap: "round",
           pathTransitionDuration: 1.5
         })}
        >
        <div className="g-label">K: {animatedK}%</div>          
        </CircularProgressbarWithChildren>
        <div style={{marginBottom:"10%"}}></div>
      </div>
      
      </>
    )
}

export default FertiliserResults