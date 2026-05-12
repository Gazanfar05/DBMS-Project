from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from database import db
from ml_model import ml_model
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route('/api/symptoms', methods=['GET'])
def get_symptoms():
    symptoms = db.get_symptoms()
    return jsonify(symptoms)

@app.route('/api/diseases', methods=['GET'])
def get_diseases():
    diseases = db.get_diseases()
    return jsonify(diseases)

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        symptoms = data.get('symptoms', [])
        age = int(data.get('age', 30))
        gender = data.get('gender', 'M')

        if len(symptoms) < 3:
            return jsonify({'error': 'Please provide at least 3 symptoms'}), 400

        # Get predictions
        disease, confidence = ml_model.predict(symptoms[:3], age, gender)
        severity = ml_model.get_severity(disease)

        # Get recommended doctors
        specializations = db.get_specialization_for_disease(
            next((d['id'] for d in db.get_diseases() if d['name'] == disease), None)
        )

        doctors = []
        if specializations:
            doctors = db.get_doctors_by_specialization(specializations[0]['id'])

        return jsonify({
            'disease': disease,
            'confidence': round(confidence, 2),
            'severity': severity,
            'doctors': doctors
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/doctors', methods=['GET'])
def get_doctors():
    specialization_id = request.args.get('specialization_id')
    if specialization_id:
        doctors = db.get_doctors_by_specialization(int(specialization_id))
    else:
        doctors = db.query("SELECT * FROM doctors LIMIT 10")
    return jsonify(doctors)

@app.route('/api/history', methods=['GET'])
def get_history():
    email = request.args.get('email')
    if not email:
        return jsonify({'error': 'Email required'}), 400
    history = db.get_user_history(email)
    return jsonify(history)

@app.route('/api/users', methods=['POST'])
def create_user():
    try:
        data = request.json
        email = data.get('email')
        name = data.get('name')
        
        if not email or not name:
            return jsonify({'error': 'Email and name required'}), 400
        
        user_id = db.get_or_create_user(name, email)
        return jsonify({'id': user_id, 'email': email})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/history', methods=['POST'])
def save_history():
    try:
        data = request.json
        query_id = db.save_user_query(
            data.get('email'),
            data.get('age'),
            data.get('gender'),
            ','.join(data.get('symptoms', [])),
            data.get('disease'),
            data.get('confidence'),
            data.get('severity'),
            data.get('doctor_id')
        )
        return jsonify({'id': query_id})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
