import numpy as np
import pandas as pd
import tensorflow as tf
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.utils import to_categorical

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
    
    def train_model(self, epochs=50, batch_size=32):
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
        
        return self.model, history
    
    def predict_crop(self, new_data):
        # Check if model is trained
        if self.model is None:
            raise ValueError("Model has not been trained. Call train_model() first.")
        
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

# Usage
if __name__ == "__main__":
    # Initialize and train the model
    crop_recommender = CropRecommendationLSTM('crop_data.csv')
    model, history = crop_recommender.train_model()
    
    # Example prediction
    new_sample = np.array([[80, 40, 60, 26, 50, 6.5, 100]])  # Example input
    recommended_crop = crop_recommender.predict_crop(new_sample)
    print(f"Recommended Crop: {recommended_crop}")
