import React from "react";
import { GoogleMap, LoadScript, Polygon, InfoWindow } from "@react-google-maps/api";

const mapContainerStyle = { width: "100%", height: "500px" };
const center = { lat: 26.8467, lng: 80.9462 }; // Default center (Lucknow, India)

const farmFields = [
  {
    id: 1,
    name: "Uttar Pradesh Farm",
    moisture: "40%",
    temperature: "32°C",
    coordinates: [
      { lat: 26.8467, lng: 80.9462 },
      { lat: 26.8468, lng: 80.9475 },
      { lat: 26.8455, lng: 80.9468 },
      { lat: 26.8458, lng: 80.9455 },
    ],
  },
  {
    id: 2,
    name: "Maharashtra Farm",
    moisture: "55%",
    temperature: "29°C",
    coordinates: [
      { lat: 19.0760, lng: 72.8777 },
      { lat: 19.0765, lng: 72.8785 },
      { lat: 19.0755, lng: 72.8780 },
      { lat: 19.0758, lng: 72.8768 },
    ],
  },
];

const FarmMap = () => {
  const [selectedField, setSelectedField] = React.useState(null);

  return (
    <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
      <GoogleMap mapContainerStyle={mapContainerStyle} center={center} zoom={15} mapTypeId="satellite">
        {/* Render Farm Fields */}
        {farmFields.map((field) => (
          <Polygon
            key={field.id}
            paths={field.coordinates}
            options={{
              fillColor: "green",
              fillOpacity: 0.5,
              strokeColor: "darkgreen",
              strokeWeight: 2,
            }}
            onClick={() => setSelectedField(field)}
          />
        ))}

        {/* Show Info Window on Click */}
        {selectedField && (
          <InfoWindow
            position={selectedField.coordinates[0]}
            onCloseClick={() => setSelectedField(null)}
          >
            <div>
              <strong>{selectedField.name}</strong> <br />
              🌱 Moisture: {selectedField.moisture} <br />
              🌡 Temperature: {selectedField.temperature}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default FarmMap;
