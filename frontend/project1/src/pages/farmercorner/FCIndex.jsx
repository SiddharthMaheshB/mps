import FarmMap from "./FM"
import "leaflet/dist/leaflet.css";
import "./common.css"
import React from "react";
import { Line } from "react-chartjs-2";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { FaTint } from "react-icons/fa";

import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";



ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);




export default function FCIndex({login}){
  const aerationData = [70, 75, 80, 78, 76];
    if(!login){
        return(
            <>
            <h1>404 Not Found!!</h1>
            </>
        )
    }
    return(
        <div>
        <div className="dashboard-container">
        <div className="map-container">
        <FarmMap/>
        </div>
        <div className="metrics-container">
        <TemperatureCard  className="Temperature" value={30}/>
        <PHCard value={8}/>
        <IrrigationCard status={"off"}/>
        
        </div>
        </div>
        <div className="graph-container">
         <MoistureCard data={moistureData}/>
         <AerationCard data={aerationData}/>
         </div>
         </div>
    )
}

const moistureData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May"],
  datasets: [
    {
      label: "Moisture (%)",
      data: [35, 40, 38, 42, 41],
      borderColor: "#3498db",
      backgroundColor: "rgba(52, 152, 219, 0.2)",
      tension: 0.4, // Smooth curve
      fill: true,
    },
  ],
};

  // Sample aeration data for the line graph
  const aerationData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [
      {
        label: 'Aeration (%)',
        data: [70, 75, 80, 78, 76],
        borderColor: '#9b59b6',
        backgroundColor: 'rgba(155, 89, 182, 0.2)',
        fill: true,
      },
    ],
  };


const TemperatureCard = ({ value }) => {
  return (
    <div className="card">
      <h3 className="text-lg font-bold" style={{ marginTop:"1%"}}>Temperature</h3>
      <CircularProgressbar
        className="circularone"
        value={value}
        text={`${value}°C`}
        styles={buildStyles({ textColor: "black", pathColor: "red"})}
      />
    </div>
  );
};


const MoistureCard = ({ data }) => {
  return (
    <div className="moisture-card">
      <h3 className="card-title">💧 Moisture Level</h3>
      <div className="chart-container">
        <Line data={data} options={{ responsive: true, maintainAspectRatio: false }} />
      </div>
    </div>
  );
};


  

  const PHCard = ({ value }) => {
    const getColor = (pH) => {
      if (pH < 7) return "red"; 
      if (pH > 7) return "blue"; 
      return "green"; 
    };
  
    return (
      <div className="card">
        <h3 className="text-lg font-bold" style={{ marginTop: "1%" }}>pH Level</h3>
        <CircularProgressbar
          value={(value / 14) * 100} 
          text={`${value}`}
          styles={buildStyles({ textColor: "black", pathColor: getColor(value) })}
        />
      </div>
    );
  };


  const AerationCard = ({ data }) => {
   
    const chartData = {
      labels: ["Jan", "Feb", "Mar", "Apr", "May"],
      datasets: [
        {
          label: "Aeration Level (%)",
          data: data,
          borderColor: "purple",
          backgroundColor: "rgba(128, 0, 128, 0.2)",
          fill: true,
          tension: 0.4, 
        },
      ],
    };
  
    return (
      <div className="aeration-card">
        <h3 className="card-title">🌬️ Aeration Level</h3>
        <div className="chart-container">
          <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
      </div>
    );
  };

const IrrigationCard = ({ status }) => {
  return (
    <div className="card"  style={{width:"80%", height:"20%"}}>
      <h3 className="card-title">Irrigation Status</h3>
      <div className={`status ${status === "On" ? "on" : "off"}`}>
        {status === "On" && <FaTint className="water-icon" />}
        {status}
      </div>
    </div>
  );
};