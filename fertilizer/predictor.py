import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import joblib


def predict_fertilizer(district, soil_color, nitrogen, phosphorus, potassium, pH, rainfall, temperature, crop,model,encoders):
    """Predicts the fertilizer based on soil analysis and crop."""
    #model = joblib.load("fertilizer_predictor.pkl")
    #label_encoders = joblib.load("label_encoders.pkl")
    
    # Encode categorical inputs
    district_encoded = encoders['District_Name'].transform([district])[0]
    soil_color_encoded = encoders['Soil_color'].transform([soil_color])[0]
    crop_encoded = encoders['Crop'].transform([crop])[0]

    # Make input DataFrame to avoid sklearn warning
    input_df = pd.DataFrame([{
        "District_Name": district_encoded,
        "Soil_color": soil_color_encoded,
        "Nitrogen": nitrogen,
        "Phosphorus": phosphorus,
        "Potassium": potassium,
        "pH": pH,
        "Rainfall": rainfall,
        "Temperature": temperature,
        "Crop": crop_encoded
    }])

    # Predict
    prediction = model.predict(input_df)[0]
    print(prediction)
    fertilizer = encoders['Fertilizer'].inverse_transform([prediction])[0]
    print("completed")
    return fertilizer
    print("completed")


