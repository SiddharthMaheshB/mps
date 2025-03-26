import React from "react";
import { MapContainer, TileLayer, Polygon, Popup } from "react-leaflet";
const center = { lat: 17.4835, lng: 78.2611 }; // Centered on your given location

const farmBoundaries = [
    {
        id: 1,
        name: "Telangana Farm",
        moisture: "50%",
        temperature: "31°C",
        coordinates: [
          { lat: 17.4849, lng: 78.2601 }, // 17°29'05.9"N 78°15'36.2"E
          { lat: 17.4851, lng: 78.2621 }, // 17°29'06.3"N 78°15'43.5"E
          { lat: 17.4823, lng: 78.2621 }, // 17°28'56.2"N 78°15'43.4"E
          { lat: 17.4823, lng: 78.2602 }, // 17°28'56.1"N 78°15'36.6"E
        ],
    }
];



const FarmMap = () => {
  return (
    <MapContainer center={center} zoom={17} style={{ height: "500px", width: "100%", borderRadius:"10px" , boxShadow:"0px 4px 10px rgba(0, 0, 0, 0.3)" ,zIndex:"0"}}>
      {/* 🌍 Satellite view from Esri */}
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        attribution="&copy; Esri, Maxar, Earthstar Geographics"
      />
      
      {/* Farm Boundaries */}
      {farmBoundaries.map((farm) => (
        <Polygon key={farm.id} positions={farm.coordinates} color="green">
          <Popup>
            <strong>{farm.name}</strong> <br />
            🌱 Moisture: {farm.moisture}
          </Popup>
        </Polygon>
      ))}
    </MapContainer>
  );
};

export default FarmMap;
