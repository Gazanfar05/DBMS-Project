import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
import joblib
import os

# Create balanced training data
def create_training_data():
    all_symptoms = ['Cough', 'Fever', 'Headache', 'Shortness of Breath', 'Chest Pain',
                    'Nausea', 'Skin Rash', 'Muscle Pain', 'Fatigue', 'Itching']
    diseases = ['Flu', 'Common Cold', 'Migraine', 'Asthma', 'Diabetes',
                'Hypertension', 'Eczema', 'Gastritis']

    data_list = []

    # Create diverse training samples
    for disease_idx, disease in enumerate(diseases):
        for age in range(20, 80, 10):
            for gender in ['M', 'F']:
                for iteration in range(5):  # Multiple variations per disease
                    # Random selection with seed for reproducibility
                    import random
                    random.seed(disease_idx * 100 + age + iteration)
                    symptoms_sample = random.sample(all_symptoms, 3)

                    data_list.append({
                        'symptom_1': symptoms_sample[0],
                        'symptom_2': symptoms_sample[1],
                        'symptom_3': symptoms_sample[2],
                        'age': age,
                        'gender': gender,
                        'disease': disease
                    })

    df = pd.DataFrame(data_list)
    return df

def train_model():
    print("Creating training data...")
    df = create_training_data()

    # Encode categorical features
    le_symptom1 = LabelEncoder()
    le_symptom2 = LabelEncoder()
    le_symptom3 = LabelEncoder()
    le_gender = LabelEncoder()
    le_disease = LabelEncoder()

    df['symptom_1_encoded'] = le_symptom1.fit_transform(df['symptom_1'])
    df['symptom_2_encoded'] = le_symptom2.fit_transform(df['symptom_2'])
    df['symptom_3_encoded'] = le_symptom3.fit_transform(df['symptom_3'])
    df['gender_encoded'] = le_gender.fit_transform(df['gender'])
    df['disease_encoded'] = le_disease.fit_transform(df['disease'])

    X = df[['symptom_1_encoded', 'symptom_2_encoded', 'symptom_3_encoded', 'age', 'gender_encoded']]
    y = df['disease_encoded']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    print("Training model...")
    model = RandomForestClassifier(
        n_estimators=50,
        max_depth=10,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42
    )
    model.fit(X_train, y_train)

    train_score = model.score(X_train, y_train)
    test_score = model.score(X_test, y_test)
    print(f"Training accuracy: {train_score:.4f}")
    print(f"Testing accuracy: {test_score:.4f}")

    # Create models directory if it doesn't exist
    os.makedirs('models', exist_ok=True)

    # Save model and encoders
    joblib.dump(model, 'models/disease_model.pkl')
    joblib.dump(le_symptom1, 'models/le_symptom1.pkl')
    joblib.dump(le_symptom2, 'models/le_symptom2.pkl')
    joblib.dump(le_symptom3, 'models/le_symptom3.pkl')
    joblib.dump(le_gender, 'models/le_gender.pkl')
    joblib.dump(le_disease, 'models/le_disease.pkl')

    print("Model saved successfully!")

if __name__ == "__main__":
    train_model()
