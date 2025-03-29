import { useState, useEffect } from "react";
import "./section2.css";
import {
  CircularProgressbarWithChildren,
  buildStyles,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const CroprecResults = ({ soilHealth, moistureLevel, phLevel, temperature }) => {
  const [aniSoilHealth, setAniSoilHealth] = useState(0);
  const [aniMoisture, setAniMoisture] = useState(0);
  const [aniPh, setAniPh] = useState(0);
  const [aniTemp, setAniTemp] = useState(0);

  useEffect(() => {
    setTimeout(() => setAniSoilHealth(soilHealth), 300);
    setTimeout(() => setAniMoisture(moistureLevel), 400);
    setTimeout(() => setAniPh(phLevel), 500);
    setTimeout(() => setAniTemp(temperature), 600);
  }, [soilHealth, moistureLevel, phLevel, temperature]);

  const getColor = (value) => {
    if (value < 40) return "#D50000";
    if (value < 70) return "#FFD600";
    return "#00c853";
  };

  return (
    <>
      <h4 className="inputheading">Crop Health Analysis</h4>
      <div className="g-container">
        <h4 style={{ marginTop: "0px" }}>Soil Health:</h4>
        <CircularProgressbarWithChildren
          className="circularone"
          value={aniSoilHealth}
          maxValue={100}
          styles={buildStyles({
            pathColor: getColor(aniSoilHealth),
            trailColor: "#e0e0e0",
            strokeLinecap: "round",
            pathTransitionDuration: 1.5,
          })}
        >
          <div className="g-label">
            {aniSoilHealth}% - {aniSoilHealth >= 70 ? "Healthy" : aniSoilHealth >= 40 ? "Moderate" : "Poor"}
          </div>
        </CircularProgressbarWithChildren>
      </div>
      <div className="g-container">
        <h4>Crop Conditions:</h4>
        <div className="h-container">
          <CircularProgressbarWithChildren
            className="circulartwo"
            value={aniMoisture}
            maxValue={100}
            styles={buildStyles({
              pathColor: getColor(aniMoisture),
              trailColor: "#e0e0e0",
              strokeLinecap: "round",
              pathTransitionDuration: 1.5,
            })}
          >
            <div className="g-label">Moisture: {aniMoisture}%</div>
          </CircularProgressbarWithChildren>

          <CircularProgressbarWithChildren
            className="circulartwo"
            value={aniPh}
            maxValue={14}
            styles={buildStyles({
              pathColor: aniPh < 5.5 ? "#ff4500" : aniPh <= 7.5 ? "#00b300" : "#0080ff",
              trailColor: "#e0e0e0",
              strokeLinecap: "round",
              pathTransitionDuration: 1.5,
            })}
          >
            <div className="g-label">pH: {aniPh}</div>
          </CircularProgressbarWithChildren>
        </div>
        <CircularProgressbarWithChildren
          className="circulartwo"
          value={aniTemp}
          maxValue={50}
          styles={buildStyles({
            pathColor: aniTemp < 30 ? "#00bfff" : aniTemp < 60 ? "#ffa500" : "#ff4500",
            trailColor: "#e0e0e0",
            strokeLinecap: "round",
            pathTransitionDuration: 1.5,
          })}
        >
          <div className="g-label">Temp: {aniTemp}°C</div>
        </CircularProgressbarWithChildren>
        <div style={{ marginBottom: "10%" }}></div>
      </div>
    </>
  );
};

export default CroprecResults;
