import { useState, useRef } from "react";
import { FiUploadCloud } from "react-icons/fi";
import { MdOutlineFilePresent } from "react-icons/md";

const FileUploader = ({ onFileUpload,onDetect }) => {
  const FASTAPI_URL = import.meta.env.VITE_FASTAPI_URL;
  const [inputfile, setFile] = useState(null);
  const [filename, setFilename] = useState("");
  const [isManualInput, setIsManualInput] = useState(false);
  const fileInputRef = useRef(null);

  // 🌱 Manual Input State
  const [formData, setFormData] = useState({
    soil_color: "",
    nitrogen: "",
    phosphorus: "",
    potassium: "",
    ph: "",
    rainfall: "",
    temperature: "",
    crop: "",
  });

  const handleFileUpload = (file) => {
    if (file && file.type.startsWith("application/pdf")) {
      const reader = new FileReader();
      reader.onload = () => {
        setFile(reader.result);
        setFilename(file.name);
        console.log(reader.result);
        onFileUpload(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Please enter a PDF file");
    }
  };

  const HandleFileChange = (event) => {
    const file = event.target.files[0];
    handleFileUpload(file);
  };

  const HandleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    handleFileUpload(file);
  };

  const HandleDrag = (event) => {
    event.preventDefault();
  };

  const filePicker = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const toggleInput = () => {
    setIsManualInput(true);
    setFile(null);
    setFilename("");
  };

  const goBack = () => {
    setIsManualInput(false);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const pl = JSON.stringify(formData)
      console.log(pl)
      const response = await fetch("http://localhost:8000/api/fertiliser/manual", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: pl,
      });
  
      if (!response.ok) throw new Error("Manual submission failed");
  
      const data = await response.json();
      console.log("✅ Fertilizer Recommendation from manual data:", data);
  
      alert("Fertilizer recommendation submitted successfully!");
      onDetect(data);
      if (onFileUpload) {
        onFileUpload(data); // optional: send response to parent
      }
    } catch (error) {
      console.error("❌ Error submitting manual data:", error);
      alert("Failed to submit manual soil data.");
    }
  };
  

  const handleFileSubmit = async () => {
    if (!inputfile) {
      alert("Please upload a file first.");
      return;
    }
  
    try {
      const blob = await fetch(inputfile).then(res => res.blob());
      const formData = new FormData();
      formData.append("file", blob, filename);
  
      const response = await fetch("http://localhost:8000/api/fertiliser/upload", {
        method: "POST",
        body: formData,
      });
  
      if (!response.ok) throw new Error("File upload failed");
  
      const data = await response.json();
      console.log("✅ Fertilizer Recommendation from uploaded file:", data);
  
      alert("Fertilizer recommendation submitted from uploaded file!");
      onDetect(data);
      if (onFileUpload) {
        onFileUpload(data); // optional: send response to parent
      }
    } catch (error) {
      console.error("❌ Error uploading file:", error);
      alert("Failed to submit uploaded file.");
    }
  };
  
  
  return (
    <div className="file-container">
      {!isManualInput ? (
        <>
          <h4 className="inputheading">Upload a File for Fertiliser Recommendation</h4>
          <div
            className="dragdropbox"
            onDrop={HandleDrop}
            onDragOver={HandleDrag}
            onClick={filePicker}
          >
            <FiUploadCloud />
            <p>Drag & drop your file here or click to browse</p>
            <input
              type="file"
              accept="pdf/*"
              className="hidden"
              ref={fileInputRef}
              onChange={HandleFileChange}
            />
          </div>
          {inputfile && (
            <div className="file-preview">
              <MdOutlineFilePresent size={24} />
              <span>{filename}</span>
            </div>
          )}
          <div>
            <button className="cameracapturebutton" onClick={handleFileSubmit}>Recommend Fertiliser</button>
          </div>
          <div>
            <button
              className="crop-type"
              onClick={toggleInput}
              style={{ border: "none", color: "white", marginBottom: "2%" }}
            >
              Enter Details Manually
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="manual-input">
            <h4 className="inputheading">Enter Soil Data Manually</h4>
            <form className="form" onSubmit={handleSubmit}>
              <label>
                Soil Color:
                <input
                  type="text"
                  name="soil_color"
                  value={formData.soil_color}
                  onChange={handleChange}
                  placeholder="e.g., reddish brown"
                />
              </label>
              <label>
                Nitrogen (mg/kg):
                <input
                  type="number"
                  name="nitrogen"
                  value={formData.nitrogen}
                  onChange={handleChange}
                  placeholder="e.g., 30"
                />
              </label>
              <label>
                Phosphorus (mg/kg):
                <input
                  type="number"
                  name="phosphorus"
                  value={formData.phosphorus}
                  onChange={handleChange}
                  placeholder="e.g., 12"
                />
              </label>
              <label>
                Potassium (mg/kg):
                <input
                  type="number"
                  name="potassium"
                  value={formData.potassium}
                  onChange={handleChange}
                  placeholder="e.g., 50"
                />
              </label>
              <label>
                pH Level:
                <input
                  type="number"
                  step="0.01"
                  name="ph"
                  value={formData.ph}
                  onChange={handleChange}
                  placeholder="Enter pH level"
                />
              </label>
              <label>
                Rainfall (mm):
                <input
                  type="number"
                  step="0.1"
                  name="rainfall"
                  value={formData.rainfall}
                  onChange={handleChange}
                  placeholder="Enter rainfall"
                />
              </label>
              <label>
                Temperature (°C):
                <input
                  type="number"
                  step="0.1"
                  name="temperature"
                  value={formData.temperature}
                  onChange={handleChange}
                  placeholder="Enter temperature"
                />
              </label>
              <label>
                Crop Type:
                <input
                  type="text"
                  name="crop"
                  value={formData.crop}
                  onChange={handleChange}
                  placeholder="e.g., Wheat, Rice"
                />
              </label>
              <button type="submit" className="recommend-btn">
                Recommend Fertilizer
              </button>
            </form>
            <div>
              <button
                className="detect-button"
                style={{ width: "100%", marginBottom: "10%" }}
                onClick={goBack}
              >
                Go Back
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FileUploader;
