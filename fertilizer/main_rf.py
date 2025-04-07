import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import joblib

# Load dataset
df = pd.read_csv("data.csv")

# Encode categorical features
label_encoders = {}
categorical_columns = ['District_Name', 'Soil_color', 'Crop']
for col in categorical_columns:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col])
    label_encoders[col] = le

# Define features and target
X = df[['District_Name', 'Soil_color', 'Nitrogen', 'Phosphorus', 'Potassium', 'pH', 'Rainfall', 'Temperature', 'Crop']]
y = df['Fertilizer']

# Encode target variable
y_le = LabelEncoder()
y = y_le.fit_transform(y)
label_encoders['Fertilizer'] = y_le

# Split dataset
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Evaluate model
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f'Model Accuracy: {accuracy * 100:.2f}%')

# Save model and encoders
joblib.dump(model, "fertilizer_predictor.pkl")
joblib.dump(label_encoders, "label_encoders.pkl")

def predict_fertilizer(district, soil_color, nitrogen, phosphorus, potassium, pH, rainfall, temperature, crop,model,label_encoders):
    """Predicts the fertilizer based on soil analysis and crop."""
    #model = joblib.load("fertilizer_predictor.pkl")
    #label_encoders = joblib.load("label_encoders.pkl")
    
    # Encode categorical inputs
    district_encoded = label_encoders['District_Name'].transform([district])[0]
    soil_color_encoded = label_encoders['Soil_color'].transform([soil_color])[0]
    crop_encoded = label_encoders['Crop'].transform([crop])[0]
    
    # Prepare input
    input_data = np.array([[district_encoded, soil_color_encoded, nitrogen, phosphorus, potassium, pH, rainfall, temperature, crop_encoded]])
    
    # Predict
    fertilizer_index = model.predict(input_data)[0]
    fertilizer = label_encoders['Fertilizer'].inverse_transform([fertilizer_index])[0]
    return fertilizer

# Example usage
predicted_fertilizer = predict_fertilizer("Kolhapur", "Red", 50, 30, 20, 6.5, 100, 25, "Wheat")
print("Predicted Fertilizer:", predicted_fertilizer)