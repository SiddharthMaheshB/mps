import FarmMap from "./FM"
import "leaflet/dist/leaflet.css";
import "./common.css"
import React from "react";
import { Line } from "react-chartjs-2";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
 

export default function FCIndex({login}){
    if(!login){
        return(
            <>
            <h1>404 Not Found!!</h1>
            </>
        )
    }
    return(
        <>
        <div className="MapContainer">
        <FarmMap/>
        <TemperatureCard value={30}/>
        
        </div>
        </>
    )
}

const moistureData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [
      {
        label: 'Moisture (%)',
        data: [35, 40, 38, 42, 41],
        borderColor: '#3498db',
        backgroundColor: 'rgba(52, 152, 219, 0.2)',
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
    <div className="absolute top-4 right-4 p-4 bg-white shadow-lg rounded-lg">
      <h3 className="text-lg font-bold">Temperature</h3>
      <CircularProgressbar
        value={value}
        text={`${value}°C`}
        styles={buildStyles({ textColor: "black", pathColor: "red" })}
      />
    </div>
  );
};


const MoistureCard = ({ data }) => {
    return (
      <div className="p-4 w-56 text-center shadow-lg bg-white rounded-2xl absolute top-4 left-4">
        <h3 className="text-lg font-bold mb-2">💧 Moisture Level</h3>
        <Line data={data} options={{ responsive: true, maintainAspectRatio: false }} />
      </div>
    );
  };
  

const PHCard = ({ value }) => {
  return (
    <div className="absolute bottom-4 right-4 p-4 bg-white shadow-lg rounded-lg">
      <h3 className="text-lg font-bold">pH Level</h3>
      <CircularProgressbar
        value={value}
        text={`${value}`}
        styles={buildStyles({ textColor: "black", pathColor: "green" })}
      />
    </div>
  );
};

const AerationCard = ({ data }) => {
  const chartData = {
    labels: data.map((_, index) => index + 1),
    datasets: [
      {
        label: "Aeration Level",
        data,
        borderColor: "purple",
        backgroundColor: "rgba(128, 0, 128, 0.2)",
      },
    ],
  };

  return (
    <div className="absolute bottom-4 left-4 p-4 bg-white shadow-lg rounded-lg">
      <h3 className="text-lg font-bold">Aeration</h3>
      <Line data={chartData} />
    </div>
  );
};

const IrrigationCard = ({ status }) => {
  return (
    <div className="absolute top-1/2 right-4 p-4 bg-white shadow-lg rounded-lg">
      <h3 className="text-lg font-bold">Irrigation Status</h3>
      <div className={`p-2 text-white ${status === "On" ? "bg-green-500" : "bg-red-500"}`}>{status}</div>
    </div>
  );
};