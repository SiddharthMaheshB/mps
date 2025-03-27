import numpy as np
import pandas as pd
import tensorflow as tf
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.utils import to_categorical
import os

class CropRecommendationLSTM:
    def __init__(self, data_path):
        # Load data
        self.df = pd.read_csv(data_path)
        
        # Separate features and target
        self.X = self.df.drop('label', axis=1)
        self.y = self.df['label']
        
        # Encode target variable
        self.label_encoder = LabelEncoder()
        self.y_encoded = self.label_encoder.fit_transform(self.y)
        
        # Scale features
        self.scaler = StandardScaler()
        self.X_scaled = self.scaler.fit_transform(self.X)
        
        # Initialize model attribute
        self.model = None
        
        # Create models directory if it doesn't exist
        self.models_dir = 'saved_models'
        os.makedirs(self.models_dir, exist_ok=True)
        
    def prepare_lstm_data(self, time_steps=3):
        # Reshape data for LSTM (samples, time steps, features)
        X_reshaped = []
        y_reshaped = []
        
        for i in range(len(self.X_scaled) - time_steps):
            X_reshaped.append(self.X_scaled[i:i+time_steps])
            y_reshaped.append(self.y_encoded[i+time_steps])
        
        return (np.array(X_reshaped), 
                to_categorical(y_reshaped, 
                num_classes=len(np.unique(self.y_encoded))))
    
    def create_lstm_model(self, input_shape, num_classes):
        model = Sequential([
            # LSTM layer with dropout for regularization
            LSTM(64, input_shape=input_shape, 
                 return_sequences=True, 
                 activation='relu'),
            Dropout(0.3),
            
            # Additional LSTM layer
            LSTM(32, activation='relu'),
            Dropout(0.2),
            
            # Dense layers for classification
            Dense(64, activation='relu'),
            Dropout(0.2),
            Dense(num_classes, activation='softmax')
        ])
        
        # Compile the model
        model.compile(
            optimizer=Adam(learning_rate=0.001),
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )
        
        return model
    
    def train_model(self, epochs=50, batch_size=32, model_name='crop_recommendation_model.h5'):
        # Prepare LSTM data
        X_lstm, y_lstm = self.prepare_lstm_data()
        
        # Split the data
        X_train, X_test, y_train, y_test = train_test_split(
            X_lstm, y_lstm, test_size=0.2, random_state=42
        )
        
        # Create and train the model
        input_shape = (X_train.shape[1], X_train.shape[2])
        num_classes = y_lstm.shape[1]
        
        # Create the model and store it as an instance attribute
        self.model = self.create_lstm_model(input_shape, num_classes)
        
        # Training with early stopping
        early_stopping = tf.keras.callbacks.EarlyStopping(
            monitor='val_loss', 
            patience=10, 
            restore_best_weights=True
        )
        
        history = self.model.fit(
            X_train, y_train,
            epochs=epochs,
            batch_size=batch_size,
            validation_split=0.2,
            callbacks=[early_stopping]
        )
        
        # Evaluate the model
        test_loss, test_accuracy = self.model.evaluate(X_test, y_test)
        print(f"Test Accuracy: {test_accuracy*100:.2f}%")
        
        # Save the model
        model_path = os.path.join(self.models_dir, model_name)
        self.save_model(model_path)
        
        return self.model, history
    
    def save_model(self, model_path):
        """
        Save the trained model, scaler, and label encoder
        """
        # Save Keras model
        self.model.save(model_path)
        
        # Save scaler and label encoder
        import joblib
        joblib.dump(self.scaler, os.path.join(self.models_dir, 'scaler.pkl'))
        joblib.dump(self.label_encoder, os.path.join(self.models_dir, 'label_encoder.pkl'))
    
    def load_model(self, model_name='crop_recommendation_model.h5'):
        """
        Load a pre-trained model, scaler, and label encoder
        """
        import joblib
        
        # Construct full paths
        model_path = os.path.join(self.models_dir, model_name)
        scaler_path = os.path.join(self.models_dir, 'scaler.pkl')
        encoder_path = os.path.join(self.models_dir, 'label_encoder.pkl')
        
        # Check if files exist
        if not (os.path.exists(model_path) and 
                os.path.exists(scaler_path) and 
                os.path.exists(encoder_path)):
            raise FileNotFoundError("Saved model, scaler, or label encoder not found.")
        
        # Load model
        self.model = load_model(model_path)
        
        # Load scaler and label encoder
        self.scaler = joblib.load(scaler_path)
        self.label_encoder = joblib.load(encoder_path)
        
        return self.model
    
    def predict_crop(self, new_data):
        # Check if model is loaded
        if self.model is None:
            raise ValueError("Model has not been loaded. Call load_model() first.")
        
        # Preprocess new data
        new_data_scaled = self.scaler.transform(new_data)
        
        # Reshape for LSTM
        new_data_reshaped = new_data_scaled.reshape(
            1, new_data_scaled.shape[0], new_data_scaled.shape[1]
        )
        
        # Make prediction
        prediction = self.model.predict(new_data_reshaped)
        predicted_class = np.argmax(prediction)
        
        return self.label_encoder.inverse_transform([predicted_class])[0]

# Usage examples
if __name__ == "__main__":
    # Scenario 1: Train and save a new model
    # crop_recommender = CropRecommendationLSTM('crop_data.csv')
    # model, history = crop_recommender.train_model()
    # 
    # # Example prediction after training
    # new_sample = np.array([[80, 40, 60, 26, 50, 6.5, 100]])  # Example input
    # recommended_crop = crop_recommender.predict_crop(new_sample)
    # print(f"Recommended Crop: {recommended_crop}")

    # Scenario 2: Load a pre-trained model
    print("\nLoading pre-trained model...")
    crop_recommender = CropRecommendationLSTM('crop_data.csv')
    model = crop_recommender.load_model()
    
    # Predict using the loaded model
    new_sample_2 = np.array([[75, 45, 55, 28, 55, 6.3, 90]])  # Another example input
    recommended_crop_2 = crop_recommender.predict_crop(new_sample_2)
    print(f"Recommended Crop: {recommended_crop_2}")
