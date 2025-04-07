from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import base64
import os
import time
import sys
import joblib
from test import get_crop_remedy
from fert import get_fertiliser_query
# Include parent dir for model import
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from diseasedetection.main import results,load_models
from fertilizer.predictor import predict_fertilizer  # Your disease detection function

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


@app.post("/api/analysis")
async def analyze(request: AnalysisRequest):
    try:
        # Extract and decode base64 image
        model1,model2  = load_cached_models()  

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



@app.get("/api/recommendation/{crop}/{disease}")
async def get_recommendation(crop: str, disease: str):
    key = f"{crop}_{disease}".lower().replace(" ", "_")
    response =  get_crop_remedy(key)
    return response



def load_fertilizer_model():
    if not hasattr(app.state, "fert_model"):
        print("📦 Loading fertilizer model into cache...")
        app.state.fert_model = joblib.load("../fertilizer/fertilizer_predictor.pkl")
        app.state.label_encoders = joblib.load("../fertilizer/label_encoders.pkl")
    return app.state.fert_model, app.state.label_encoders

class FertilizerInput(BaseModel):
    soil_color: str
    nitrogen: float
    phosphorus: float
    potassium: float
    ph: float
    rainfall: float
    temperature: float
    crop: str

@app.post("/api/fertiliser/manual")
async def get_fertilizer_manual(data: FertilizerInput):
    try:
        model, encoders = load_fertilizer_model()
        fertilizer = predict_fertilizer("Kolhapur", data.soil_color, data.nitrogen, data.phosphorus, data.potassium, data.ph, data.rainfall, data.temperature, data.crop ,model,encoders)
        return {"recommended_fertilizer": f"{fertilizer}","nitrogen":data.nitrogen,"phosphorus": data.phosphorus,"potassium": data.potassium}

    except Exception as e:
        print(str(e))
        return JSONResponse(status_code=500, content={"error": str(e)})


from fastapi import UploadFile, File
import pandas as pd
import numpy as np
import io

@app.post("/api/fertiliser/upload")
async def get_fertilizer_from_file(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))

        model, label_encoders = load_fertilizer_model()
        recommendations = []

        for _, row in df.iterrows():
            try:
                fertilizer = predict_fertilizer(
                    district=row["district"],
                    soil_color=row["soil_color"],
                    nitrogen=row["nitrogen"],
                    phosphorus=row["phosphorus"],
                    potassium=row["potassium"],
                    pH=row["pH"],
                    rainfall=row["rainfall"],
                    temperature=row["temperature"],
                    crop=row["crop"],
                    model=model,
                    label_encoders=label_encoders
                )

                recommendations.append({
                    "row": row.to_dict(),
                    "recommended_fertilizer": f"{fertilizer}"
                })
            except Exception as inner_e:
                recommendations.append({
                    "row": row.to_dict(),
                    "error": f"❌ Error: {str(inner_e)}"
                })

        return {"recommendations": recommendations,"nitrogen":row["nitrogen"],"phosphorus":row["phosphorus"], "potassium":row["potassium"]}

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


class FertilizerRecoRequest(BaseModel):
    fertilizer: str
    nitrogen: float
    phosphorus: float
    potassium: float

@app.post("/api/fertiliser/recommendation")
async def fertiliser_recommendations(data: FertilizerRecoRequest):
    response = get_fertiliser_query(data.fertilizer,data.nitrogen,data.phosphorus,data.potassium)
    response["npk_values"] = {
        "n": data.nitrogen,
        "p": data.phosphorus,
        "k": data.potassium
    }
    print(response)
    return response