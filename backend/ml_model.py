import joblib
import os
import numpy as np

class MLModel:
    def __init__(self):
        self.model = None
        self.le_symptom1 = None
        self.le_symptom2 = None
        self.le_symptom3 = None
        self.le_gender = None
        self.le_disease = None
        self.load_model()

    def load_model(self):
        try:
            base_path = os.path.join(os.path.dirname(__file__), 'models')
            self.model = joblib.load(os.path.join(base_path, 'disease_model.pkl'))
            self.le_symptom1 = joblib.load(os.path.join(base_path, 'le_symptom1.pkl'))
            self.le_symptom2 = joblib.load(os.path.join(base_path, 'le_symptom2.pkl'))
            self.le_symptom3 = joblib.load(os.path.join(base_path, 'le_symptom3.pkl'))
            self.le_gender = joblib.load(os.path.join(base_path, 'le_gender.pkl'))
            self.le_disease = joblib.load(os.path.join(base_path, 'le_disease.pkl'))
        except Exception as e:
            print(f"Error loading model: {e}")

    def predict(self, symptoms, age, gender):
        try:
            # Encode inputs - handle unknown symptoms gracefully
            try:
                symptom_1_encoded = self.le_symptom1.transform([symptoms[0]])[0]
            except:
                symptom_1_encoded = 0

            try:
                symptom_2_encoded = self.le_symptom2.transform([symptoms[1]])[0]
            except:
                symptom_2_encoded = 0

            try:
                symptom_3_encoded = self.le_symptom3.transform([symptoms[2]])[0]
            except:
                symptom_3_encoded = 0

            gender_encoded = self.le_gender.transform([gender])[0]

            # Create feature vector
            X = np.array([[symptom_1_encoded, symptom_2_encoded, symptom_3_encoded, age, gender_encoded]])

            # Make prediction
            prediction = self.model.predict(X)[0]
            probabilities = self.model.predict_proba(X)[0]
            confidence = max(probabilities) * 100

            disease = self.le_disease.inverse_transform([prediction])[0]

            return disease, confidence
        except Exception as e:
            print(f"Prediction error: {e}")
            return None, 0

    def get_severity(self, disease):
        severity_map = {
            'Flu': 'Medium',
            'Common Cold': 'Low',
            'Migraine': 'Medium',
            'Asthma': 'High',
            'Diabetes': 'High',
            'Hypertension': 'High',
            'Eczema': 'Low',
            'Gastritis': 'Medium'
        }
        return severity_map.get(disease, 'Medium')

ml_model = MLModel()
