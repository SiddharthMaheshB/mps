import pandas as pd
import numpy as np
import tensorflow as tf
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau, ModelCheckpoint
from tensorflow.keras.layers import Dense, Dropout, LSTM, BatchNormalization, Bidirectional
from sklearn.model_selection import StratifiedKFold, train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler, RobustScaler, PolynomialFeatures
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.feature_selection import SelectFromModel
from sklearn.utils.class_weight import compute_class_weight
from sklearn.metrics import classification_report
import joblib
import optuna
from imblearn.over_sampling import SMOTE

# Load dataset
df = pd.read_csv("fertilizer/data.csv")

# Feature Engineering
def engineer_features(df):
    # Create interaction features between nutrients
    df['N_P_ratio'] = df['Nitrogen'] / (df['Phosphorus'] + 1)  # Adding 1 to avoid division by zero
    df['N_K_ratio'] = df['Nitrogen'] / (df['Potassium'] + 1)
    df['P_K_ratio'] = df['Phosphorus'] / (df['Potassium'] + 1)
    df['NPK_sum'] = df['Nitrogen'] + df['Phosphorus'] + df['Potassium']
    
    # pH interactions (optimal nutrient availability occurs at specific pH ranges)
    df['pH_squared'] = df['pH'] ** 2
    df['N_pH_interaction'] = df['Nitrogen'] * df['pH']
    df['P_pH_interaction'] = df['Phosphorus'] * df['pH']
    df['K_pH_interaction'] = df['Potassium'] * df['pH']
    
    # Temperature and Rainfall features
    df['Temp_Rain_ratio'] = df['Temperature'] / (df['Rainfall'] + 1)
    
    # Handle outliers in numerical columns
    num_cols = ['Nitrogen', 'Phosphorus', 'Potassium', 'pH', 'Rainfall', 'Temperature']
    for col in num_cols:
        Q1 = df[col].quantile(0.25)
        Q3 = df[col].quantile(0.75)
        IQR = Q3 - Q1
        lower_bound = Q1 - 1.5 * IQR
        upper_bound = Q3 + 1.5 * IQR
        df[col] = df[col].clip(lower_bound, upper_bound)
    
    return df

# Apply feature engineering
df = engineer_features(df)

# Encode categorical features
label_encoders = {}
categorical_columns = ['District_Name', 'Soil_color', 'Crop', 'Fertilizer']
for col in categorical_columns:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col])
    label_encoders[col] = le

# Define features and target
# Include engineered features
feature_columns = [
    'District_Name', 'Soil_color', 'Nitrogen', 'Phosphorus', 'Potassium', 
    'pH', 'Rainfall', 'Temperature', 'Crop', 'N_P_ratio', 'N_K_ratio', 
    'P_K_ratio', 'NPK_sum', 'pH_squared', 'N_pH_interaction', 
    'P_pH_interaction', 'K_pH_interaction', 'Temp_Rain_ratio'
]
X = df[feature_columns]
y = df['Fertilizer']

# Try different scalers
scaler = RobustScaler()  # Better handles outliers than StandardScaler
X_scaled = scaler.fit_transform(X)

# Create polynomial features for soil properties
poly = PolynomialFeatures(degree=2, interaction_only=True, include_bias=False)
X_poly = poly.fit_transform(X_scaled)

# Advanced feature selection using RandomForestClassifier with tuned parameters
rf = RandomForestClassifier(n_estimators=200, max_depth=15, min_samples_split=5, random_state=42)
rf.fit(X_poly, y)
importances = rf.feature_importances_
selector = SelectFromModel(rf, threshold="median", prefit=True)
X_selected = selector.transform(X_poly)
selected_features = selector.get_support(indices=True)
print(f"Selected {len(selected_features)} out of {X_poly.shape[1]} features")

# Define a function for Optuna to optimize model hyperparameters
# def objective(trial):
#     # Define hyperparameters to optimize
#     lstm_units_1 = trial.suggest_int('lstm_units_1', 32, 128)
#     lstm_units_2 = trial.suggest_int('lstm_units_2', 16, 64)
#     dense_units = trial.suggest_int('dense_units', 16, 64)
#     dropout_rate = trial.suggest_float('dropout_rate', 0.1, 0.5)
#     learning_rate = trial.suggest_float('learning_rate', 1e-4, 1e-2, log=True)
#     batch_size = trial.suggest_categorical('batch_size', [16, 32, 64])
#     
#     # Define model with trial hyperparameters
#     model = tf.keras.Sequential([
#         Bidirectional(LSTM(lstm_units_1, return_sequences=True, input_shape=(1, X_selected.shape[1]))),
#         Dropout(dropout_rate),
#         BatchNormalization(),
#         Bidirectional(LSTM(lstm_units_2)),
#         Dropout(dropout_rate),
#         BatchNormalization(),
#         Dense(dense_units, activation='relu'),
#         BatchNormalization(),
#         Dropout(dropout_rate/2),
#         Dense(len(np.unique(y)), activation='softmax')
#     ])
#     
#     # Compile model
#     model.compile(
#         loss='sparse_categorical_crossentropy', 
#         optimizer=tf.keras.optimizers.Adam(learning_rate=learning_rate), 
#         metrics=['accuracy']
#     )
#     
#     # Setup cross-validation
#     cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
#     cv_scores = []
#     
#     for train_idx, val_idx in cv.split(X_selected, y):
#         X_train_cv, X_val_cv = X_selected[train_idx], X_selected[val_idx]
#         y_train_cv, y_val_cv = y[train_idx], y[val_idx]
#         
#         # Apply SMOTE to handle class imbalance (only on training data)
#         smote = SMOTE(random_state=42)
#         X_train_cv_flat = X_train_cv.reshape(X_train_cv.shape[0], -1)
#         X_train_cv_flat, y_train_cv = smote.fit_resample(X_train_cv_flat, y_train_cv)
#         X_train_cv = X_train_cv_flat.reshape(X_train_cv_flat.shape[0], 1, X_selected.shape[1])
#         
#         # Reshape for LSTM
#         X_val_cv = X_val_cv.reshape(X_val_cv.shape[0], 1, X_selected.shape[1])
#         
#         # Get class weights
#         class_weights = compute_class_weight(
#             class_weight='balanced',
#             classes=np.unique(y_train_cv),
#             y=y_train_cv
#         )
#         class_weight_dict = {i: weight for i, weight in enumerate(class_weights)}
#         
#         # Callbacks
#         early_stopping = EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True)
#         reduce_lr = ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=5, min_lr=1e-6)
#         
#         # Train model
#         model.fit(
#             X_train_cv, y_train_cv,
#             epochs=50,
#             batch_size=batch_size,
#             validation_data=(X_val_cv, y_val_cv),
#             callbacks=[early_stopping, reduce_lr],
#             class_weight=class_weight_dict,
#             verbose=0
#         )
#         
#         # Evaluate model
#         _, accuracy = model.evaluate(X_val_cv, y_val_cv, verbose=0)
#         cv_scores.append(accuracy)
#     
#     # Return mean accuracy across folds
#     return np.mean(cv_scores)

def objective(trial):
    # Define hyperparameters to optimize
    lstm_units_1 = trial.suggest_int('lstm_units_1', 32, 128)
    lstm_units_2 = trial.suggest_int('lstm_units_2', 16, 64)
    dense_units = trial.suggest_int('dense_units', 16, 64)
    dropout_rate = trial.suggest_float('dropout_rate', 0.1, 0.5)
    learning_rate = trial.suggest_float('learning_rate', 1e-4, 1e-2, log=True)
    batch_size = trial.suggest_categorical('batch_size', [16, 32, 64])
    
    # Define model with trial hyperparameters
    model = tf.keras.Sequential([
        Bidirectional(LSTM(lstm_units_1, return_sequences=True, input_shape=(1, X_selected.shape[1]))),
        Dropout(dropout_rate),
        BatchNormalization(),
        Bidirectional(LSTM(lstm_units_2)),
        Dropout(dropout_rate),
        BatchNormalization(),
        Dense(dense_units, activation='relu'),
        BatchNormalization(),
        Dropout(dropout_rate/2),
        Dense(len(np.unique(y)), activation='softmax')
    ])
    
    # Compile model
    model.compile(
        loss='sparse_categorical_crossentropy', 
        optimizer=tf.keras.optimizers.Adam(learning_rate=learning_rate), 
        metrics=['accuracy']
    )
    
    # Setup cross-validation
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    cv_scores = []
    
    for train_idx, val_idx in cv.split(X_selected, y):
        X_train_cv, X_val_cv = X_selected[train_idx], X_selected[val_idx]
        y_train_cv, y_val_cv = y[train_idx], y[val_idx]
        
        # Reshape for LSTM
        X_train_cv_flat = X_train_cv.reshape(X_train_cv.shape[0], -1)
        
        # Safer SMOTE application with fallback
        try:
            # Check if SMOTE is applicable
            unique_classes = np.unique(y_train_cv)
            class_counts = [np.sum(y_train_cv == cls) for cls in unique_classes]
            
            # Only apply SMOTE if there are enough samples
            if all(count > 5 for count in class_counts):
                smote = SMOTE(random_state=42, k_neighbors=min(5, min(class_counts)-1))
                X_train_cv_flat, y_train_cv = smote.fit_resample(X_train_cv_flat, y_train_cv)
            
            # Reshape for LSTM
            X_train_cv = X_train_cv_flat.reshape(X_train_cv_flat.shape[0], 1, X_selected.shape[1])
            X_val_cv = X_val_cv.reshape(X_val_cv.shape[0], 1, X_selected.shape[1])
            
            # Get class weights
            class_weights = compute_class_weight(
                class_weight='balanced',
                classes=np.unique(y_train_cv),
                y=y_train_cv
            )
            class_weight_dict = {i: weight for i, weight in enumerate(class_weights)}
            
            # Callbacks
            early_stopping = EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True)
            reduce_lr = ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=5, min_lr=1e-6)
            
            # Train model
            history = model.fit(
                X_train_cv, y_train_cv,
                epochs=50,
                batch_size=batch_size,
                validation_data=(X_val_cv, y_val_cv),
                callbacks=[early_stopping, reduce_lr],
                class_weight=class_weight_dict,
                verbose=0
            )
            
            # Evaluate model
            _, accuracy = model.evaluate(X_val_cv, y_val_cv, verbose=0)
            cv_scores.append(accuracy)
        
        except Exception as e:
            print(f"Error in trial: {e}")
            return 0.5  # Return a default score if SMOTE fails
    
    # Return mean accuracy across folds
    return np.mean(cv_scores) if cv_scores else 0.5

# Run Optuna study to find best hyperparameters
study = optuna.create_study(direction='maximize')
study.optimize(objective, n_trials=20)

# Get best hyperparameters
best_params = study.best_params
print("Best hyperparameters:", best_params)

# Create final dataset split
X_train, X_test, y_train, y_test = train_test_split(X_selected, y, test_size=0.2, random_state=42, stratify=y)

# Apply SMOTE for class balancing
smote = SMOTE(random_state=42)
X_train_flat = X_train.reshape(X_train.shape[0], -1)
X_train_flat, y_train = smote.fit_resample(X_train_flat, y_train)
X_train = X_train_flat.reshape(X_train_flat.shape[0], 1, X_selected.shape[1])

# Reshape test data for LSTM
X_test = X_test.reshape(X_test.shape[0], 1, X_selected.shape[1])

# Calculate class weights
class_weights = compute_class_weight('balanced', classes=np.unique(y_train), y=y_train)
class_weight_dict = {i: weight for i, weight in enumerate(class_weights)}

# Build final ensemble of models
# 1. LSTM model with optimized hyperparameters
lstm_model = tf.keras.Sequential([
    Bidirectional(LSTM(best_params['lstm_units_1'], return_sequences=True, input_shape=(1, X_selected.shape[1]))),
    Dropout(best_params['dropout_rate']),
    BatchNormalization(),
    Bidirectional(LSTM(best_params['lstm_units_2'])),
    Dropout(best_params['dropout_rate']),
    BatchNormalization(),
    Dense(best_params['dense_units'], activation='relu'),
    BatchNormalization(),
    Dropout(best_params['dropout_rate']/2),
    Dense(len(np.unique(y)), activation='softmax')
])

lstm_model.compile(
    loss='sparse_categorical_crossentropy',
    optimizer=tf.keras.optimizers.Adam(learning_rate=best_params['learning_rate']),
    metrics=['accuracy']
)

# Callbacks for training
model_checkpoint = ModelCheckpoint(
    'best_lstm_model.h5',
    monitor='val_accuracy',
    save_best_only=True,
    mode='max',
    verbose=1
)
early_stopping = EarlyStopping(monitor='val_loss', patience=15, restore_best_weights=True)
reduce_lr = ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=5, min_lr=1e-6)

# Train LSTM model
lstm_history = lstm_model.fit(
    X_train, y_train,
    epochs=100,
    batch_size=best_params['batch_size'],
    validation_data=(X_test, y_test),
    callbacks=[early_stopping, reduce_lr, model_checkpoint],
    class_weight=class_weight_dict,
    verbose=1
)

# 2. Train a Gradient Boosting model for ensemble
X_train_flat = X_train.reshape(X_train.shape[0], -1)
X_test_flat = X_test.reshape(X_test.shape[0], -1)

gb_model = GradientBoostingClassifier(
    n_estimators=200,
    learning_rate=0.1,
    max_depth=5,
    random_state=42
)
gb_model.fit(X_train_flat, y_train)

# Evaluate individual models
lstm_model = tf.keras.models.load_model('best_lstm_model.h5')  # Load best model saved during training
lstm_loss, lstm_accuracy = lstm_model.evaluate(X_test, y_test)
lstm_predictions = np.argmax(lstm_model.predict(X_test), axis=-1)

gb_accuracy = gb_model.score(X_test_flat, y_test)
gb_predictions = gb_model.predict(X_test_flat)

print(f'LSTM Model Accuracy: {lstm_accuracy * 100:.2f}%')
print(f'Gradient Boosting Model Accuracy: {gb_accuracy * 100:.2f}%')

# Create a simple ensemble (majority voting)
ensemble_predictions = np.zeros((X_test.shape[0], len(np.unique(y))))
ensemble_predictions += np.eye(len(np.unique(y)))[lstm_predictions]
ensemble_predictions += np.eye(len(np.unique(y)))[gb_predictions]
final_predictions = np.argmax(ensemble_predictions, axis=1)

ensemble_accuracy = np.mean(final_predictions == y_test)
print(f'Ensemble Model Accuracy: {ensemble_accuracy * 100:.2f}%')

print("Classification Report for Ensemble:")
print(classification_report(y_test, final_predictions))

# Save all components
joblib.dump(label_encoders, "label_encoders.pkl")
joblib.dump(scaler, "scaler.pkl")
joblib.dump(poly, "poly_features.pkl")
joblib.dump(selector, "selector.pkl")
joblib.dump(gb_model, "gb_model.pkl")
lstm_model.save("best_lstm_model.h5")

# Updated prediction function for ensemble model
def predict_fertilizer(district, soil_color, nitrogen, phosphorus, potassium, pH, rainfall, temperature, crop):
    """Predicts the fertilizer based on soil analysis and crop using ensemble model."""
    # Load models and preprocessing components
    lstm_model = tf.keras.models.load_model("best_lstm_model.h5")
    gb_model = joblib.load("gb_model.pkl")
    label_encoders = joblib.load("label_encoders.pkl")
    scaler = joblib.load("scaler.pkl")
    poly = joblib.load("poly_features.pkl")
    selector = joblib.load("selector.pkl")
    
    # Encode categorical inputs
    district_encoded = label_encoders['District_Name'].transform([district])[0]
    soil_color_encoded = label_encoders['Soil_color'].transform([soil_color])[0]
    crop_encoded = label_encoders['Crop'].transform([crop])[0]
    
    # Create initial input
    input_data = pd.DataFrame({
        'District_Name': [district_encoded],
        'Soil_color': [soil_color_encoded],
        'Nitrogen': [nitrogen],
        'Phosphorus': [phosphorus],
        'Potassium': [potassium],
        'pH': [pH],
        'Rainfall': [rainfall],
        'Temperature': [temperature],
        'Crop': [crop_encoded]
    })
    
    # Engineer features (must match training pipeline)
    input_data['N_P_ratio'] = input_data['Nitrogen'] / (input_data['Phosphorus'] + 1)
    input_data['N_K_ratio'] = input_data['Nitrogen'] / (input_data['Potassium'] + 1)
    input_data['P_K_ratio'] = input_data['Phosphorus'] / (input_data['Potassium'] + 1)
    input_data['NPK_sum'] = input_data['Nitrogen'] + input_data['Phosphorus'] + input_data['Potassium']
    input_data['pH_squared'] = input_data['pH'] ** 2
    input_data['N_pH_interaction'] = input_data['Nitrogen'] * input_data['pH']
    input_data['P_pH_interaction'] = input_data['Phosphorus'] * input_data['pH']
    input_data['K_pH_interaction'] = input_data['Potassium'] * input_data['pH']
    input_data['Temp_Rain_ratio'] = input_data['Temperature'] / (input_data['Rainfall'] + 1)
    
    # Scale, generate polynomial features, and select features
    input_scaled = scaler.transform(input_data)
    input_poly = poly.transform(input_scaled)
    input_selected = selector.transform(input_poly)
    
    # Make predictions from both models
    input_lstm = input_selected.reshape(1, 1, input_selected.shape[1])
    lstm_pred = np.argmax(lstm_model.predict(input_lstm), axis=-1)[0]
    
    input_gb = input_selected.reshape(1, -1)
    gb_pred = gb_model.predict(input_gb)[0]
    
    # Ensemble prediction (using the most confident prediction)
    lstm_probs = np.max(lstm_model.predict(input_lstm), axis=-1)[0]
    gb_probs = np.max(gb_model.predict_proba(input_gb), axis=-1)[0]
    
    if lstm_probs >= gb_probs:
        final_pred = lstm_pred
    else:
        final_pred = gb_pred
    
    fertilizer = label_encoders['Fertilizer'].inverse_transform([final_pred])[0]
    return fertilizer

# Example usage
predicted_fertilizer = predict_fertilizer("Kolhapur", "Red", 50, 30, 20, 6.5, 100, 25, "Wheat")
print("Predicted Fertilizer:", predicted_fertilizer)
