# HealthMatch - Symptom to Doctor Recommender

HealthMatch is a full-stack healthcare support system with a 3D interactive frontend, Flask backend, PostgreSQL database, and a machine learning prediction engine.

Users can enter symptoms, get a predicted condition with confidence and severity, receive specialist recommendations, and save/view diagnosis history.

## Tech Stack

- Frontend: React
- Backend: Flask + Flask-CORS
- Database: PostgreSQL
- ML: scikit-learn + joblib

## Key Features

- 3D-style animated frontend (particle background, tilt cards, animated widgets)
- Symptom search and multi-select workflow
- Disease prediction with confidence score
- Severity classification
- Doctor recommendations by specialization
- User-based history save and retrieval

## Project Structure

```text
DBMS project/
├── backend/
│   ├── app.py
│   ├── database.py
│   ├── ml_model.py
│   ├── train_model.py
│   ├── requirements.txt
│   └── models/
├── database/
│   └── schema.sql
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js
│   │   ├── index.js
│   │   └── components/
│   ├── package.json
│   └── .env
└── readme.md
```

## Prerequisites

- Node.js 18+
- Python 3.10+
- PostgreSQL 14+

## Quick Start

### 1. Database Setup

```bash
createdb symptom_doctor_db
psql symptom_doctor_db < database/schema.sql
```

If database already exists and you want a clean reset:

```bash
dropdb symptom_doctor_db
createdb symptom_doctor_db
psql symptom_doctor_db < database/schema.sql
```

### 2. Backend Setup and Run

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python train_model.py
python app.py
```

Backend runs at: http://localhost:5000

### 3. Frontend Setup and Run

Open a new terminal:

```bash
cd frontend
npm install
npm start
```

Frontend runs at: http://localhost:3000

## Environment Variables

Frontend file: frontend/.env

```env
REACT_APP_API_URL=http://localhost:5000/api
```

Backend supports these optional variables:

- DB_HOST (default: localhost)
- DB_PORT (default: 5432)
- DB_NAME (default: symptom_doctor_db)
- DB_USER (default: postgres)
- DB_PASSWORD (default: postgres)

## API Endpoints

Base URL: http://localhost:5000/api

- GET /symptoms: list available symptoms
- GET /diseases: list diseases
- POST /users: create/get user by email
- POST /predict: get prediction and recommended doctors
- GET /history?email=user@example.com: fetch user history
- POST /history: save prediction to history
- GET /health: service health check

## Typical User Flow

1. Enter name, email, age, and gender.
2. Add at least 3 symptoms.
3. Click Analyze Symptoms.
4. Review predicted condition, confidence, severity, and doctors.
5. Save the result and check History.

## Notes

- This tool is for educational and support use only.
- Always consult a licensed healthcare professional for diagnosis and treatment.
