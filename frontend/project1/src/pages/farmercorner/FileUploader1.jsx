import { useState, useRef } from "react";
import { FiUploadCloud } from "react-icons/fi";
import { MdOutlineFilePresent } from "react-icons/md";

const FileUploader1 = ({ onFileUpload }) => {
  const [inputfile, setFile] = useState(null);
  const [filename, setFilename] = useState("");
  const [isManualInput, setIsManualInput] = useState(false);
  const fileInputRef = useRef(null);

  // 🌱 Manual Input State
  const [formData, setFormData] = useState({
    nitrogen: "",
    phosphorus: "",
    potassium: "",
    ph: "",
    rainfall: "",
    temperature: "",
    humidity: "",
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

  // 🧪 Simulate API call
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitted Soil Data:", formData);
    alert("Crop recommendation submitted!");
    // You could reset the form if you like:
    // setFormData({...});
  };
  const handleFileSubmit = () => {
    if (!inputfile) {
      alert("Please upload a file first.");
      return;
    }
  
    // Simulate API call
    console.log("Submitting uploaded file for recommendation:", filename);
    alert("Fertilizer recommendation submitted based on uploaded file!");
  
    // Optionally: you can pass data to a parent component here or call a real API
    if (onFileUpload) {
      onFileUpload(inputfile); // already contains base64
    }
  };

  return (
    <div className="file-container">
      {!isManualInput ? (
        <>
          <h4 className="inputheading">Upload a File for Crop Recommendation</h4>
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
            <button className="cameracapturebutton" onClick={handleFileSubmit}>Recommend Crop</button>
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
                Humidity:
                <input
                  type="number"
                  step="0.1"
                  name="humidity"
                  value={formData.humidity}
                  onChange={handleChange}
                  placeholder="Enter Humidity"
                />
              </label>
              <button type="submit" className="recommend-btn">
                Recommend Crop
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

export default FileUploader1;
