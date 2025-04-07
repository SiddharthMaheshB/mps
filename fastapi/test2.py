import os
import time
import sys
import joblib
from test import get_crop_remedy
# Include parent dir for model import
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from diseasedetection.main import results,load_models
from fertilizer.predictor import predict_fertilizer 

def load_fertilizer_model():
   
        print("📦 Loading fertilizer model into cache...")
        fert_model = joblib.load("../fertilizer/fertilizer_predictor.pkl")
        label_encoders = joblib.load("../fertilizer/label_encoders.pkl")
        return fert_model,label_encoders


model, encoders = load_fertilizer_model()
fertilizer = predict_fertilizer("Kolhapur", "Red", 50, 30, 20, 6.5, 100, 25, "Wheat",model,encoders)
print(fertilizer)