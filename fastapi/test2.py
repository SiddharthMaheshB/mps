from crop.main import CropRecommendationLSTM
import numpy as np


print("\nLoading pre-trained model...")


crop_model_instance = CropRecommendationLSTM("crop/crop_data.csv")
crop_model_instance.load_model("crop/saved_models/crop_recommendation_model.h5")

  
print("📦 Loading crop recommendation model...")

# Predict using the loaded model
new_sample_2 = np.array([[75, 45, 55, 28, 55, 6.3, 90]])  # Another example input
recommended_crop_2 = crop_model_instance.predict_crop(new_sample_2)
print(f"Recommended Crop: {recommended_crop_2}")