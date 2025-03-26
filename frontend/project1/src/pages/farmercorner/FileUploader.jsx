
import { useState, useRef } from "react";
import { FiUploadCloud } from "react-icons/fi";
import { MdOutlineFilePresent } from "react-icons/md";
const FileUploader = ({ onFileUpload }) => {
        const [inputfile,setFile] = useState(null);
        const [filename,setFilename] = useState("");
        const [cropType, setCropType] = useState("");
        const [isManualInput,setIsManualInput ] = useState(false);
        const fileInputRef = useRef(null);
        
        const handleFileUpload= (file)=>{
            if(file &&file.type.startsWith("application/pdf")){
                const reader  = new FileReader();
                reader.onload = ()=>{
                    setFile(reader.result);
                    setFilename(file.name)
                    console.log(reader.result)
                    onFileUpload(reader.result)
                }
                reader.readAsDataURL(file)

            }else{
                alert("please enter a pdf file")
            }
        }
        const HandleFileChange = (event)=>{
           const file = event.target.files[0];
            handleFileUpload(file)
        }
        const HandleDrop = (event)=>{
            event.preventDefault();
            const file = event.dataTransfer.files[0];
            handleFileUpload(file);

        }
        const HandleDrag = (event)=>{
            event.preventDefault();
        }
        const filePicker = ()=>{
            if(fileInputRef.current)
            fileInputRef.current.click();
        }

        const toggleInput = ()=>{
            setIsManualInput(true);
            setFile(null);
            setFilename("");
        }

        const goBack = ()=>{
            setIsManualInput(false);
        }

        return(
            <div className="file-container">
            {!isManualInput?(
            <>
                <h4 className="inputheading">Upload a File for Fertiliser Recommendation</h4>
                <div className="dragdropbox"
                onDrop={HandleDrop}
                onDragOver={HandleDrag}
                onClick={filePicker}>
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
                        <MdOutlineFilePresent size={24}/>
                        <span>{filename}</span>
                    </div>
                )}
                <div >
                    <button className="cameracapturebutton">Recommend Fertiliser</button>
                </div>
                <div>
                    <button className="crop-type" onClick={toggleInput} style={{border:"none",color:"white",marginBottom:"2%"}}>Enter Details Manually</button>
                </div>
            </>
            
        ):(
         <>
            {/* Manual Input Form */}
            <div className="manual-input">
                <h4 className="inputheading">Enter Soil Data Manually</h4>
                <form className="form">
                    <label>
                        pH Level:
                        <input type="number" step="0.01" placeholder="Enter pH level"  />
                    </label>
                    <label>
                        Moisture (%):
                        <input type="number" step="0.1" placeholder="Enter moisture %" />
                    </label>
                    <label>
                        Temperature (°C):
                        <input type="number" step="0.1" placeholder="Enter temperature" />
                    </label>
                    <label>
                        Crop Type:
                        <input type="text" placeholder="Enter crop type" />
                    </label>
                    <button type="submit" className="recommend-btn">
                        Recommend Fertilizer
                    </button>
                </form>
                <div>
                <button className="detect-button" style={{width:"100%",marginBottom:"10%"}} onClick={goBack}>
                    Go Back
                </button>
            </div>
            </div>

            
        </>

        )}
        </div>
        )
         

   
};

export default FileUploader;
