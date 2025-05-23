import { useState, useRef } from "react";
import { FiUploadCloud, FiCamera } from "react-icons/fi";

const ImageUploader = ({ onImageUpload, onDetect,buttonname }) => {
  const FASTAPI_URL = import.meta.env.VITE_FASTAPI_URL;
  const [image, setImage] = useState(null);
  const [cropType, setCropType] = useState("");
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [fadeOutVideo, setFadeOutVideo] = useState(false);
  const [fadeOutImage, setFadeOutImage] = useState(false);

  const handleImageUpload = (file) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result);
        onImageUpload(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    handleImageUpload(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    handleImageUpload(file);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const openFilePicker = () => {
    fileInputRef.current.click();
  };

  const handleCameraCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL("image/png");
      setImage(imageData);
      onImageUpload(imageData);

      // Fade out video before closing
      setFadeOutVideo(true);
      setTimeout(() => {
        setCameraOpen(false); // Close camera after transition
        setFadeOutVideo(false);
      }, 500);

      // Stop the video stream
      if (video.srcObject) {
        const tracks = video.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        video.srcObject = null;
      }
    }
  };

  const startCamera = async () => {
    setCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const handleDetectPesticide = async () => {
    if (!image) {
      alert("Please upload an image.");
      return;
    }
  
    const payload = {
      imageData: image, // already base64
      detectedAt: new Date().toISOString()
    };
  
    try {
      const response = await fetch("http://localhost:8000/api/analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
  
      if (!response.ok) {
        throw new Error("Detection failed");
      }
  
      const data = await response.json();
      data.img = `${FASTAPI_URL}${data.img}`;
      console.log("✅ Detection result:", data);
      
      alert(`✅ Detection Complete!\n\nDisease: ${data.disease}\nSeverity: ${data.severity}%\nConfidence: ${data.confidence}%`);

      onDetect(data);
      setFadeOutImage(true);
      setTimeout(() => {
        setImage(null);
        setCropType("");
        setFadeOutImage(false);
      }, 500);
    } catch (err) {
      console.error("❌ Error during detection:", err);
      alert("Something went wrong. Check console.");
    }
  };
  
  
  return (
    <>


      {/* Drag & Drop Box */}
      <div
        className="dragdropbox"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={openFilePicker}
      >
        <FiUploadCloud />
        <p>Drag & drop your image here or click to browse</p>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
      </div>

      {/* Camera Capture */}
      <button onClick={startCamera} className="cameracapturebutton">
        <FiCamera /> Capture from Camera
      </button>

      {/* Show Video Stream if Camera is Open */}
      {cameraOpen && (
        <div className={`video-container ${fadeOutVideo ? "fade-out" : ""}`}>
          <video ref={videoRef} autoPlay className="video"></video>
          <button onClick={handleCameraCapture}>Capture Image</button>
          <canvas ref={canvasRef} className="hidden"></canvas>
        </div>
      )}

      

      {/* Preview Uploaded Image */}
      {image && (
        <div className={`preview ${fadeOutImage ? "fade-out" : ""}`}>
          <p className="text-white text-sm">Preview:</p>
          <img
            src={image}
            alt="Uploaded Preview"
            
          />
        </div>
      )}

      {/* Detect Pesticide Button */}
      <button className="detect-button" disabled={!image} onClick={handleDetectPesticide}>
        {buttonname}
      </button>

      {/* Styles */}
      <style>
  {`
    .fade-out {
      opacity: 0;
      transition: opacity 0.5s ease-in-out;
    }
  `}
</style>

    </>
  );
};

export default ImageUploader;
