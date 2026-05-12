# Symptom-to-Doctor Recommender System

A healthcare support system combining ML prediction with intelligent doctor recommendations. Users input symptoms, get disease predictions with confidence scores, and receive personalized doctor recommendations.

## Tech Stack
- **Frontend**: React.js with Tailwind CSS
- **Backend**: Flask (Python)
- **Database**: PostgreSQL
- **ML**: Scikit-learn

## Project Structure
```
symptom-doctor-recommender/
├── backend/
│   ├── app.py
│   ├── models.py
│   ├── database.py
│   ├── ml_model.py
│   ├── train_model.py
│   ├── requirements.txt
│   └── data/
│       └── training_data.csv
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── .env
├── database/
│   └── schema.sql
└── README.md
```

## Setup Instructions

### 1. Database Setup
```bash
# Create PostgreSQL database
createdb symptom_doctor_db

# Import schema
psql symptom_doctor_db < database/schema.sql
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Train the ML model
python train_model.py

# Run the Flask server
python app.py
```
Server will run on `http://localhost:5000`

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```
Frontend will run on `http://localhost:3000`

## Features
✨ Symptom-based disease prediction
✨ Confidence scoring
✨ Severity assessment
✨ Doctor recommendations by specialization
✨ User query history
✨ Modern, responsive UI

## API Endpoints
- `POST /api/predict` - Get disease prediction
- `GET /api/doctors` - Get doctor recommendations
- `GET /api/history` - User query history
- `POST /api/history` - Save query to history
