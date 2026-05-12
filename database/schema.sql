-- Create tables for Symptom-Doctor Recommender System

CREATE TABLE diseases (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    severity_level VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE symptoms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE disease_symptoms (
    id SERIAL PRIMARY KEY,
    disease_id INTEGER NOT NULL REFERENCES diseases(id) ON DELETE CASCADE,
    symptom_id INTEGER NOT NULL REFERENCES symptoms(id) ON DELETE CASCADE,
    frequency FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(disease_id, symptom_id)
);

CREATE TABLE specializations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE doctors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    specialization_id INTEGER NOT NULL REFERENCES specializations(id),
    location VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    available BOOLEAN DEFAULT TRUE,
    rating FLOAT DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE disease_specialization (
    id SERIAL PRIMARY KEY,
    disease_id INTEGER NOT NULL REFERENCES diseases(id) ON DELETE CASCADE,
    specialization_id INTEGER NOT NULL REFERENCES specializations(id) ON DELETE CASCADE,
    UNIQUE(disease_id, specialization_id)
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    age INTEGER,
    gender VARCHAR(20),
    email VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_queries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    symptoms TEXT,
    predicted_disease VARCHAR(255),
    confidence_score FLOAT,
    severity_level VARCHAR(50),
    recommended_doctor_id INTEGER REFERENCES doctors(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data

INSERT INTO specializations (name, description) VALUES
('Cardiologist', 'Heart and cardiovascular diseases'),
('Dermatologist', 'Skin diseases and conditions'),
('Gastroenterologist', 'Digestive system diseases'),
('Neurologist', 'Nervous system and brain diseases'),
('Pulmonologist', 'Respiratory system diseases'),
('Ophthalmologist', 'Eye diseases and vision'),
('Rheumatologist', 'Joint and autoimmune diseases'),
('Infectious Disease Specialist', 'Infectious diseases');

INSERT INTO diseases (name, description, severity_level) VALUES
('Flu', 'Influenza viral infection', 'medium'),
('Common Cold', 'Viral respiratory infection', 'low'),
('Migraine', 'Severe headache disorder', 'medium'),
('Asthma', 'Chronic respiratory condition', 'high'),
('Diabetes', 'Blood sugar disorder', 'high'),
('Hypertension', 'High blood pressure', 'high'),
('Eczema', 'Skin inflammation condition', 'low'),
('Gastritis', 'Stomach lining inflammation', 'medium');

INSERT INTO symptoms (name, description) VALUES
('Cough', 'Persistent or acute cough'),
('Fever', 'Elevated body temperature'),
('Headache', 'Pain in the head region'),
('Shortness of Breath', 'Difficulty breathing'),
('Chest Pain', 'Pain in chest region'),
('Nausea', 'Stomach discomfort'),
('Skin Rash', 'Skin irritation or redness'),
('Muscle Pain', 'Pain in muscles'),
('Fatigue', 'Extreme tiredness'),
('Itching', 'Skin itching sensation');

INSERT INTO disease_symptoms (disease_id, symptom_id, frequency) VALUES
(1, 1, 0.95), (1, 2, 0.90), (1, 3, 0.80), (1, 9, 0.75),
(2, 1, 0.85), (2, 2, 0.50), (2, 3, 0.60),
(3, 3, 0.95), (3, 9, 0.70),
(4, 4, 0.90), (4, 1, 0.40),
(6, 3, 0.50), (6, 9, 0.40),
(7, 7, 0.95), (7, 10, 0.90),
(8, 6, 0.85), (8, 9, 0.60);

INSERT INTO disease_specialization (disease_id, specialization_id) VALUES
(1, 5), (2, 5), (3, 4), (4, 5), (5, 1), (6, 1), (7, 2), (8, 3);

INSERT INTO doctors (name, specialization_id, location, phone, email, rating) VALUES
('Dr. Sarah Johnson', 5, 'New York', '+1-555-0101', 'sarah.johnson@hospital.com', 4.8),
('Dr. Michael Chen', 4, 'Los Angeles', '+1-555-0102', 'michael.chen@hospital.com', 4.7),
('Dr. Emily Rodriguez', 2, 'Chicago', '+1-555-0103', 'emily.rodriguez@hospital.com', 4.9),
('Dr. James Wilson', 1, 'Houston', '+1-555-0104', 'james.wilson@hospital.com', 4.6),
('Dr. Lisa Anderson', 3, 'Phoenix', '+1-555-0105', 'lisa.anderson@hospital.com', 4.8),
('Dr. Robert Taylor', 5, 'Philadelphia', '+1-555-0106', 'robert.taylor@hospital.com', 4.7);

-- Create indexes for better performance
CREATE INDEX idx_disease_symptoms_disease ON disease_symptoms(disease_id);
CREATE INDEX idx_disease_symptoms_symptom ON disease_symptoms(symptom_id);
CREATE INDEX idx_user_queries_user ON user_queries(user_id);
CREATE INDEX idx_doctors_specialization ON doctors(specialization_id);
