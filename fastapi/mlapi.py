from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import base64
import os
import time
import sys
import joblib

# Include parent dir for model import
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from diseasedetection.main import results,load_models  # Your disease detection function

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
from fastapi.staticfiles import StaticFiles

# Mount the 'static' folder so it's accessible via the browser
app.mount("/static", StaticFiles(directory="static"), name="static")

UPLOAD_DIR = "static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Dummy recommendation data
recommendations = {
    "apple_soba": {
        "remedy": "Use certified virus-free planting material. Monitor trees and remove infected ones.",
        "dosage": "No chemical treatment. Focus on prevention and sanitation."
    },
    "musk": {
        "remedy": "Neem oil spray is effective for musk pests.",
        "dosage": "Mix 5ml neem oil with 1L water. Spray weekly."
    }
}

# Request schema
class AnalysisRequest(BaseModel):
    imageData: str  # base64 encoded image
    detectedAt: str

def load_cached_models():
    if not hasattr(app.state, "model1") or not hasattr(app.state, "model2"):
        print("📦 Loading models into cache...")
        model1, model2 = load_models(
            "../diseasedetection/weights/stage_one.h5",
            "../diseasedetection/weights/models.pkl"
        )
        app.state.model1 = model1
        app.state.model2 = model2
    else:
        print("✅ Models loaded from cache.")

    return app.state.model1, app.state.model2

model1,model2  = load_cached_models()  

@app.post("/api/analysis")
async def analyze(request: AnalysisRequest):
    try:
        # Extract and decode base64 image
        base64_data = request.imageData.split(",")[-1]
        image_bytes = base64.b64decode(base64_data)

        # Save image
        filename = f"img_{int(time.time())}.png"
        filepath = os.path.join(UPLOAD_DIR, filename)
        with open(filepath, "wb") as f:
            f.write(image_bytes)

        # Perform analysis
       
        prediction = results(filepath,model1,model2)
       
        crop, disease = prediction.strip().split(" ")
       

        return {
            "severity": 60,
            "confidence": 70,
            "pesticide": disease.lower().replace(" ", "_"),
            "img": f"/{filepath}",
            "crop": crop,
            "disease": disease
        }

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.get("/api/recommendation/{disease}")
def get_recommendations(disease):
    return recommendations[disease]
