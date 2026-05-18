-- ═══════════════════════════════════════════════════════════════
-- HealthMatch v2 - Complete PostgreSQL Schema
-- Includes: full medical data, location, appointments, users
-- ═══════════════════════════════════════════════════════════════

-- ── Core lookup tables ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS specializations (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    icon        VARCHAR(10) DEFAULT '🏥',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS diseases (
    id             SERIAL PRIMARY KEY,
    name           VARCHAR(255) NOT NULL UNIQUE,
    description    TEXT,
    severity_level VARCHAR(20) CHECK (severity_level IN ('Low','Medium','High','Critical')),
    icd_code       VARCHAR(20),
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS symptoms (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    body_system VARCHAR(100),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── Mapping tables ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS disease_symptoms (
    id          SERIAL PRIMARY KEY,
    disease_id  INTEGER NOT NULL REFERENCES diseases(id) ON DELETE CASCADE,
    symptom_id  INTEGER NOT NULL REFERENCES symptoms(id) ON DELETE CASCADE,
    frequency   FLOAT DEFAULT 0.5 CHECK (frequency BETWEEN 0 AND 1),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(disease_id, symptom_id)
);

CREATE TABLE IF NOT EXISTS disease_specialization (
    id                  SERIAL PRIMARY KEY,
    disease_id          INTEGER NOT NULL REFERENCES diseases(id) ON DELETE CASCADE,
    specialization_id   INTEGER NOT NULL REFERENCES specializations(id) ON DELETE CASCADE,
    is_primary          BOOLEAN DEFAULT TRUE,
    UNIQUE(disease_id, specialization_id)
);

-- ── Users ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
    id           SERIAL PRIMARY KEY,
    name         VARCHAR(255) NOT NULL,
    age          INTEGER CHECK (age BETWEEN 0 AND 150),
    gender       VARCHAR(10) CHECK (gender IN ('M','F','Other')),
    email        VARCHAR(255) UNIQUE NOT NULL,
    phone        VARCHAR(20),
    city         VARCHAR(100) DEFAULT 'Bengaluru',
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── Doctors ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS doctors (
    id                SERIAL PRIMARY KEY,
    name              VARCHAR(255) NOT NULL,
    specialization_id INTEGER NOT NULL REFERENCES specializations(id),
    clinic_name       VARCHAR(255),
    location          VARCHAR(255) NOT NULL,
    address           TEXT,
    area              VARCHAR(100),
    city              VARCHAR(100) DEFAULT 'Bengaluru',
    phone             VARCHAR(20),
    email             VARCHAR(255),
    available         BOOLEAN DEFAULT TRUE,
    rating            FLOAT DEFAULT 0.0 CHECK (rating BETWEEN 0 AND 5),
    experience_years  INTEGER DEFAULT 0,
    consultation_fee  INTEGER DEFAULT 500,
    latitude          DOUBLE PRECISION,
    longitude         DOUBLE PRECISION,
    languages         VARCHAR(255) DEFAULT 'English, Kannada',
    timings           VARCHAR(255) DEFAULT '9:00 AM - 6:00 PM',
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── Appointments ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS appointments (
    id                 SERIAL PRIMARY KEY,
    doctor_id          INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    user_id            INTEGER REFERENCES users(id) ON DELETE SET NULL,
    patient_name       VARCHAR(255) NOT NULL,
    patient_email      VARCHAR(255) NOT NULL,
    patient_phone      VARCHAR(20),
    appointment_date   DATE NOT NULL,
    appointment_time   TIME NOT NULL,
    status             VARCHAR(20) DEFAULT 'Booked' CHECK (status IN ('Booked','Confirmed','Completed','Cancelled','No-Show')),
    notes              TEXT,
    created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(doctor_id, appointment_date, appointment_time)
);

-- ── Consultation history ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_queries (
    id                    SERIAL PRIMARY KEY,
    user_id               INTEGER REFERENCES users(id) ON DELETE SET NULL,
    symptoms              TEXT,
    predicted_disease     VARCHAR(255),
    all_predictions       JSONB,
    confidence_score      FLOAT,
    severity_level        VARCHAR(20),
    recommended_doctor_id INTEGER REFERENCES doctors(id),
    ai_summary            TEXT,
    notes                 TEXT,
    user_lat              DOUBLE PRECISION,
    user_lng              DOUBLE PRECISION,
    created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── Indexes ───────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_disease_symptoms_disease   ON disease_symptoms(disease_id);
CREATE INDEX IF NOT EXISTS idx_disease_symptoms_symptom   ON disease_symptoms(symptom_id);
CREATE INDEX IF NOT EXISTS idx_user_queries_user          ON user_queries(user_id);
CREATE INDEX IF NOT EXISTS idx_doctors_specialization     ON doctors(specialization_id);
CREATE INDEX IF NOT EXISTS idx_doctors_available          ON doctors(available);
CREATE INDEX IF NOT EXISTS idx_doctors_city               ON doctors(city);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_date   ON appointments(doctor_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_email         ON appointments(patient_email);
CREATE INDEX IF NOT EXISTS idx_users_email                ON users(email);

-- ═══════════════════════════════════════════════════════════════
-- SEED DATA — Bengaluru-specific doctors, expanded diseases
-- ═══════════════════════════════════════════════════════════════

-- Specializations
INSERT INTO specializations (name, description, icon) VALUES
('General Physician',        'General medicine and common illnesses',                 '🩺'),
('Pulmonologist',            'Respiratory system, lungs and breathing disorders',     '🫁'),
('Neurologist',              'Brain, spinal cord and nervous system disorders',       '🧠'),
('Dermatologist',            'Skin, hair and nail conditions',                        '🔬'),
('Cardiologist',             'Heart and cardiovascular system disorders',             '❤️'),
('Gastroenterologist',       'Digestive system and gastrointestinal disorders',      '🫀'),
('Endocrinologist',          'Hormonal and metabolic disorders including diabetes',   '⚗️'),
('ENT Specialist',           'Ear, nose, throat and sinus conditions',               '👂'),
('Orthopedic Surgeon',       'Bones, joints, muscles and musculoskeletal system',    '🦴'),
('Rheumatologist',           'Autoimmune, joint and connective tissue diseases',      '💊'),
('Allergist/Immunologist',   'Allergies, asthma and immune system disorders',         '🌿'),
('Infectious Disease',       'Bacterial, viral and parasitic infections',             '🦠'),
('Psychiatrist',             'Mental health and psychiatric disorders',               '🧘'),
('Ophthalmologist',          'Eye diseases and vision disorders',                    '👁️'),
('Urologist',                'Urinary tract and renal system disorders',              '🫘'),
('Nephrologist',             'Kidney diseases and renal conditions',                  '🫘'),
('Hematologist',             'Blood disorders and hematological conditions',          '🩸'),
('Emergency Medicine',       'Acute and emergency medical conditions',               '🚨')
ON CONFLICT (name) DO NOTHING;

-- Diseases (expanded to 30+)
INSERT INTO diseases (name, description, severity_level, icd_code) VALUES
('Influenza (Flu)',           'Viral respiratory infection caused by influenza virus',                     'Medium',   'J10'),
('Common Cold',              'Upper respiratory viral infection, usually rhinovirus',                     'Low',      'J00'),
('Migraine',                 'Severe recurrent headache with neurological symptoms',                     'Medium',   'G43'),
('Asthma',                   'Chronic inflammatory airway disease with bronchospasm',                    'High',     'J45'),
('Type 2 Diabetes',          'Metabolic disorder with elevated blood sugar levels',                      'High',     'E11'),
('Hypertension',             'Persistently elevated arterial blood pressure',                            'High',     'I10'),
('Eczema (Atopic Dermatitis)','Chronic inflammatory skin condition with itchy rash',                     'Low',      'L20'),
('Gastritis',                'Inflammation of the stomach lining',                                       'Medium',   'K29'),
('Typhoid Fever',            'Systemic bacterial infection by Salmonella typhi',                         'High',     'A01'),
('Dengue Fever',             'Mosquito-borne viral hemorrhagic fever',                                   'High',     'A90'),
('Malaria',                  'Mosquito-borne parasitic blood infection',                                 'High',     'B50'),
('Tuberculosis',             'Bacterial lung infection by Mycobacterium tuberculosis',                   'High',     'A15'),
('Pneumonia',                'Lung infection causing inflammation of air sacs',                          'High',     'J18'),
('GERD',                     'Gastroesophageal reflux disease with acid regurgitation',                  'Medium',   'K21'),
('Irritable Bowel Syndrome', 'Functional gastrointestinal disorder with abdominal pain',                 'Medium',   'K58'),
('Anxiety Disorder',         'Excessive persistent worry and fear responses',                            'Medium',   'F41'),
('Depression',               'Mood disorder with persistent sadness and loss of interest',               'High',     'F32'),
('Urinary Tract Infection',  'Bacterial infection of the urinary system',                                'Medium',   'N39'),
('Kidney Stones',            'Hard mineral deposits forming in the kidneys',                             'High',     'N20'),
('Anemia',                   'Reduced red blood cells or hemoglobin in the blood',                       'Medium',   'D64'),
('Psoriasis',                'Chronic autoimmune skin condition with scaly plaques',                     'Medium',   'L40'),
('Hypothyroidism',           'Underactive thyroid gland with insufficient hormone production',           'Medium',   'E03'),
('Hyperthyroidism',          'Overactive thyroid with excess hormone production',                        'Medium',   'E05'),
('Rheumatoid Arthritis',     'Chronic autoimmune joint inflammation',                                    'High',     'M05'),
('Osteoarthritis',           'Degenerative joint disease with cartilage breakdown',                      'Medium',   'M15'),
('Chronic Kidney Disease',   'Progressive loss of kidney function over time',                            'Critical', 'N18'),
('Conjunctivitis',           'Inflammation of the eye conjunctiva (pink eye)',                           'Low',      'H10'),
('Sinusitis',                'Inflammation of the sinuses causing nasal congestion',                     'Low',      'J32'),
('Appendicitis',             'Acute inflammation of the appendix - surgical emergency',                  'Critical', 'K37'),
('COVID-19',                 'Coronavirus respiratory illness caused by SARS-CoV-2',                     'High',     'U07')
ON CONFLICT (name) DO NOTHING;

-- Symptoms (expanded to 60+)
INSERT INTO symptoms (name, description, body_system) VALUES
('Fever',                   'Body temperature above 37.5°C',                  'Systemic'),
('Cough',                   'Forceful expulsion of air from lungs',            'Respiratory'),
('Headache',                'Pain in the head or upper neck',                  'Neurological'),
('Fatigue',                 'Extreme tiredness and lack of energy',            'Systemic'),
('Shortness of Breath',     'Difficulty breathing or breathlessness',          'Respiratory'),
('Chest Pain',              'Pain or pressure in the chest region',            'Cardiovascular'),
('Nausea',                  'Sensation of wanting to vomit',                   'Gastrointestinal'),
('Vomiting',                'Forceful expulsion of stomach contents',          'Gastrointestinal'),
('Diarrhea',                'Loose or watery bowel movements',                 'Gastrointestinal'),
('Muscle Pain',             'Aching or soreness in muscles',                   'Musculoskeletal'),
('Skin Rash',               'Visible change in skin texture or colour',        'Dermatological'),
('Itching',                 'Pruritus - urge to scratch skin',                 'Dermatological'),
('Sore Throat',             'Pain or irritation in the throat',                'ENT'),
('Runny Nose',              'Excess nasal mucus discharge',                    'ENT'),
('Sneezing',                'Involuntary forceful expulsion through nose',     'ENT'),
('Joint Pain',              'Pain in one or more joints',                      'Musculoskeletal'),
('Back Pain',               'Pain in the lumbar or thoracic back region',      'Musculoskeletal'),
('Abdominal Pain',          'Pain or discomfort in the stomach area',          'Gastrointestinal'),
('Bloating',                'Feeling of fullness or gas in abdomen',           'Gastrointestinal'),
('Loss of Appetite',        'Reduced desire or inability to eat',              'Systemic'),
('Weight Loss',             'Unintentional decrease in body weight',           'Systemic'),
('Weight Gain',             'Unexplained increase in body weight',             'Systemic'),
('Excessive Thirst',        'Polydipsia - abnormal increase in thirst',        'Endocrine'),
('Frequent Urination',      'Polyuria - urinating more than usual',            'Urological'),
('Burning Urination',       'Pain or burning sensation during urination',      'Urological'),
('Blood in Urine',          'Hematuria - presence of blood in urine',          'Urological'),
('Swollen Lymph Nodes',     'Enlarged lymph nodes under skin',                 'Immune'),
('Night Sweats',            'Excessive sweating during sleep',                 'Systemic'),
('Chills',                  'Feeling of cold with shivering',                  'Systemic'),
('Dizziness',               'Sensation of spinning or lightheadedness',        'Neurological'),
('Blurred Vision',          'Loss of sharpness in vision',                     'Ophthalmological'),
('Eye Redness',             'Redness or irritation in one or both eyes',       'Ophthalmological'),
('Ear Pain',                'Pain inside or around the ear',                   'ENT'),
('Nasal Congestion',        'Blocked or stuffed nose',                         'ENT'),
('Palpitations',            'Noticeable rapid or irregular heartbeat',         'Cardiovascular'),
('Swollen Ankles',          'Oedema - fluid retention in the ankles',          'Cardiovascular'),
('Cold Hands and Feet',     'Poor circulation causing cold extremities',       'Cardiovascular'),
('Dry Skin',                'Skin that is rough, flaky or tight',              'Dermatological'),
('Hair Loss',               'Alopecia - thinning or falling of hair',          'Dermatological'),
('Excessive Sweating',      'Hyperhidrosis - abnormally increased sweating',   'Systemic'),
('Tremors',                 'Involuntary rhythmic muscle movement',             'Neurological'),
('Memory Problems',         'Difficulty with memory and concentration',        'Neurological'),
('Anxiety',                 'Persistent feelings of worry and nervousness',    'Psychiatric'),
('Mood Swings',             'Rapid changes in emotional state',                'Psychiatric'),
('Sleep Problems',          'Insomnia or difficulty with sleep quality',       'Psychiatric'),
('Loss of Taste',           'Reduced or absent sense of taste (ageusia)',      'Neurological'),
('Loss of Smell',           'Reduced or absent sense of smell (anosmia)',      'Neurological'),
('Wheezing',                'High-pitched whistling sound when breathing',     'Respiratory'),
('Blood in Stool',          'Presence of blood in faeces',                     'Gastrointestinal'),
('Constipation',            'Difficulty or infrequent bowel movements',        'Gastrointestinal'),
('Heartburn',               'Burning sensation in the chest after eating',     'Gastrointestinal'),
('Acid Reflux',             'Stomach acid flowing back into oesophagus',       'Gastrointestinal'),
('Painful Periods',         'Dysmenorrhoea - severe menstrual cramps',         'Reproductive'),
('Swollen Joints',          'Inflammation causing joint swelling',             'Musculoskeletal'),
('Stiff Joints',            'Reduced range of motion in joints',               'Musculoskeletal'),
('Numbness',                'Loss of sensation in body parts',                 'Neurological'),
('Tingling',                'Pins and needles sensation in extremities',       'Neurological'),
('High Blood Pressure',     'Systolic BP above 140 or diastolic above 90',    'Cardiovascular'),
('Jaundice',                'Yellowing of skin and eyes (icterus)',            'Hepatological'),
('Swollen Face',            'Facial oedema or puffiness',                     'Immune'),
('Difficulty Swallowing',   'Dysphagia - trouble swallowing food or liquid',   'Gastrointestinal')
ON CONFLICT (name) DO NOTHING;

-- disease_symptoms mappings (comprehensive, disease_id references INSERT order above)
-- Note: Using subqueries for safety
INSERT INTO disease_symptoms (disease_id, symptom_id, frequency)
SELECT d.id, s.id, freq FROM (VALUES
  -- Influenza
  ('Influenza (Flu)', 'Fever', 0.95),
  ('Influenza (Flu)', 'Cough', 0.90),
  ('Influenza (Flu)', 'Muscle Pain', 0.85),
  ('Influenza (Flu)', 'Fatigue', 0.80),
  ('Influenza (Flu)', 'Headache', 0.75),
  ('Influenza (Flu)', 'Chills', 0.70),
  ('Influenza (Flu)', 'Sore Throat', 0.60),
  -- Common Cold
  ('Common Cold', 'Runny Nose', 0.95),
  ('Common Cold', 'Sneezing', 0.90),
  ('Common Cold', 'Sore Throat', 0.80),
  ('Common Cold', 'Cough', 0.75),
  ('Common Cold', 'Nasal Congestion', 0.70),
  ('Common Cold', 'Fever', 0.40),
  -- Migraine
  ('Migraine', 'Headache', 0.99),
  ('Migraine', 'Nausea', 0.80),
  ('Migraine', 'Vomiting', 0.60),
  ('Migraine', 'Blurred Vision', 0.55),
  ('Migraine', 'Dizziness', 0.50),
  -- Asthma
  ('Asthma', 'Shortness of Breath', 0.95),
  ('Asthma', 'Wheezing', 0.90),
  ('Asthma', 'Cough', 0.85),
  ('Asthma', 'Chest Pain', 0.60),
  ('Asthma', 'Fatigue', 0.50),
  -- Type 2 Diabetes
  ('Type 2 Diabetes', 'Excessive Thirst', 0.90),
  ('Type 2 Diabetes', 'Frequent Urination', 0.90),
  ('Type 2 Diabetes', 'Fatigue', 0.80),
  ('Type 2 Diabetes', 'Blurred Vision', 0.70),
  ('Type 2 Diabetes', 'Weight Loss', 0.60),
  ('Type 2 Diabetes', 'Numbness', 0.55),
  -- Hypertension
  ('Hypertension', 'Headache', 0.70),
  ('Hypertension', 'Dizziness', 0.65),
  ('Hypertension', 'High Blood Pressure', 0.99),
  ('Hypertension', 'Chest Pain', 0.50),
  ('Hypertension', 'Blurred Vision', 0.45),
  ('Hypertension', 'Palpitations', 0.40),
  -- Eczema
  ('Eczema (Atopic Dermatitis)', 'Itching', 0.99),
  ('Eczema (Atopic Dermatitis)', 'Skin Rash', 0.99),
  ('Eczema (Atopic Dermatitis)', 'Dry Skin', 0.90),
  -- Gastritis
  ('Gastritis', 'Abdominal Pain', 0.95),
  ('Gastritis', 'Nausea', 0.80),
  ('Gastritis', 'Vomiting', 0.65),
  ('Gastritis', 'Bloating', 0.70),
  ('Gastritis', 'Loss of Appetite', 0.60),
  -- Typhoid
  ('Typhoid Fever', 'Fever', 0.99),
  ('Typhoid Fever', 'Abdominal Pain', 0.80),
  ('Typhoid Fever', 'Headache', 0.75),
  ('Typhoid Fever', 'Fatigue', 0.85),
  ('Typhoid Fever', 'Loss of Appetite', 0.70),
  ('Typhoid Fever', 'Diarrhea', 0.65),
  -- Dengue
  ('Dengue Fever', 'Fever', 0.99),
  ('Dengue Fever', 'Muscle Pain', 0.90),
  ('Dengue Fever', 'Joint Pain', 0.85),
  ('Dengue Fever', 'Headache', 0.80),
  ('Dengue Fever', 'Skin Rash', 0.70),
  ('Dengue Fever', 'Fatigue', 0.85),
  -- Malaria
  ('Malaria', 'Fever', 0.99),
  ('Malaria', 'Chills', 0.90),
  ('Malaria', 'Muscle Pain', 0.80),
  ('Malaria', 'Headache', 0.75),
  ('Malaria', 'Fatigue', 0.85),
  ('Malaria', 'Vomiting', 0.60),
  -- Tuberculosis
  ('Tuberculosis', 'Cough', 0.95),
  ('Tuberculosis', 'Fever', 0.85),
  ('Tuberculosis', 'Night Sweats', 0.80),
  ('Tuberculosis', 'Weight Loss', 0.80),
  ('Tuberculosis', 'Fatigue', 0.80),
  ('Tuberculosis', 'Blood in Stool', 0.30),
  -- Pneumonia
  ('Pneumonia', 'Fever', 0.90),
  ('Pneumonia', 'Cough', 0.95),
  ('Pneumonia', 'Shortness of Breath', 0.85),
  ('Pneumonia', 'Chest Pain', 0.70),
  ('Pneumonia', 'Fatigue', 0.80),
  ('Pneumonia', 'Chills', 0.65),
  -- GERD
  ('GERD', 'Heartburn', 0.99),
  ('GERD', 'Acid Reflux', 0.95),
  ('GERD', 'Chest Pain', 0.60),
  ('GERD', 'Sore Throat', 0.50),
  ('GERD', 'Cough', 0.40),
  -- IBS
  ('Irritable Bowel Syndrome', 'Abdominal Pain', 0.95),
  ('Irritable Bowel Syndrome', 'Bloating', 0.90),
  ('Irritable Bowel Syndrome', 'Diarrhea', 0.70),
  ('Irritable Bowel Syndrome', 'Constipation', 0.65),
  -- Anxiety
  ('Anxiety Disorder', 'Anxiety', 0.99),
  ('Anxiety Disorder', 'Palpitations', 0.75),
  ('Anxiety Disorder', 'Sleep Problems', 0.80),
  ('Anxiety Disorder', 'Excessive Sweating', 0.60),
  ('Anxiety Disorder', 'Tremors', 0.50),
  ('Anxiety Disorder', 'Dizziness', 0.55),
  -- Depression
  ('Depression', 'Fatigue', 0.90),
  ('Depression', 'Sleep Problems', 0.85),
  ('Depression', 'Mood Swings', 0.80),
  ('Depression', 'Loss of Appetite', 0.75),
  ('Depression', 'Memory Problems', 0.65),
  -- UTI
  ('Urinary Tract Infection', 'Burning Urination', 0.99),
  ('Urinary Tract Infection', 'Frequent Urination', 0.95),
  ('Urinary Tract Infection', 'Abdominal Pain', 0.70),
  ('Urinary Tract Infection', 'Blood in Urine', 0.55),
  ('Urinary Tract Infection', 'Fever', 0.50),
  -- Kidney Stones
  ('Kidney Stones', 'Back Pain', 0.95),
  ('Kidney Stones', 'Abdominal Pain', 0.90),
  ('Kidney Stones', 'Blood in Urine', 0.80),
  ('Kidney Stones', 'Nausea', 0.70),
  ('Kidney Stones', 'Vomiting', 0.60),
  -- Anemia
  ('Anemia', 'Fatigue', 0.95),
  ('Anemia', 'Dizziness', 0.80),
  ('Anemia', 'Shortness of Breath', 0.75),
  ('Anemia', 'Headache', 0.65),
  ('Anemia', 'Cold Hands and Feet', 0.60),
  -- Psoriasis
  ('Psoriasis', 'Skin Rash', 0.99),
  ('Psoriasis', 'Itching', 0.90),
  ('Psoriasis', 'Dry Skin', 0.85),
  ('Psoriasis', 'Joint Pain', 0.40),
  -- Hypothyroidism
  ('Hypothyroidism', 'Fatigue', 0.90),
  ('Hypothyroidism', 'Weight Gain', 0.85),
  ('Hypothyroidism', 'Hair Loss', 0.75),
  ('Hypothyroidism', 'Dry Skin', 0.70),
  ('Hypothyroidism', 'Cold Hands and Feet', 0.65),
  ('Hypothyroidism', 'Memory Problems', 0.55),
  -- Hyperthyroidism
  ('Hyperthyroidism', 'Weight Loss', 0.85),
  ('Hyperthyroidism', 'Palpitations', 0.90),
  ('Hyperthyroidism', 'Excessive Sweating', 0.80),
  ('Hyperthyroidism', 'Tremors', 0.70),
  ('Hyperthyroidism', 'Anxiety', 0.65),
  -- Rheumatoid Arthritis
  ('Rheumatoid Arthritis', 'Joint Pain', 0.99),
  ('Rheumatoid Arthritis', 'Swollen Joints', 0.95),
  ('Rheumatoid Arthritis', 'Stiff Joints', 0.90),
  ('Rheumatoid Arthritis', 'Fatigue', 0.75),
  ('Rheumatoid Arthritis', 'Fever', 0.40),
  -- Osteoarthritis
  ('Osteoarthritis', 'Joint Pain', 0.99),
  ('Osteoarthritis', 'Stiff Joints', 0.90),
  ('Osteoarthritis', 'Swollen Joints', 0.60),
  ('Osteoarthritis', 'Back Pain', 0.70),
  -- Chronic Kidney Disease
  ('Chronic Kidney Disease', 'Fatigue', 0.90),
  ('Chronic Kidney Disease', 'Swollen Ankles', 0.85),
  ('Chronic Kidney Disease', 'Frequent Urination', 0.80),
  ('Chronic Kidney Disease', 'Nausea', 0.70),
  ('Chronic Kidney Disease', 'Loss of Appetite', 0.65),
  -- Conjunctivitis
  ('Conjunctivitis', 'Eye Redness', 0.99),
  ('Conjunctivitis', 'Itching', 0.85),
  ('Conjunctivitis', 'Blurred Vision', 0.50),
  -- Sinusitis
  ('Sinusitis', 'Nasal Congestion', 0.99),
  ('Sinusitis', 'Headache', 0.85),
  ('Sinusitis', 'Sore Throat', 0.60),
  ('Sinusitis', 'Fever', 0.55),
  ('Sinusitis', 'Fatigue', 0.50),
  -- Appendicitis
  ('Appendicitis', 'Abdominal Pain', 0.99),
  ('Appendicitis', 'Fever', 0.85),
  ('Appendicitis', 'Nausea', 0.80),
  ('Appendicitis', 'Vomiting', 0.70),
  ('Appendicitis', 'Loss of Appetite', 0.75),
  -- COVID-19
  ('COVID-19', 'Fever', 0.85),
  ('COVID-19', 'Cough', 0.90),
  ('COVID-19', 'Fatigue', 0.85),
  ('COVID-19', 'Loss of Taste', 0.75),
  ('COVID-19', 'Loss of Smell', 0.75),
  ('COVID-19', 'Shortness of Breath', 0.65),
  ('COVID-19', 'Muscle Pain', 0.60)
) AS t(dname, sname, freq)
JOIN diseases d ON d.name = t.dname
JOIN symptoms s ON s.name = t.sname
ON CONFLICT (disease_id, symptom_id) DO NOTHING;

-- disease_specialization mappings
INSERT INTO disease_specialization (disease_id, specialization_id, is_primary)
SELECT d.id, sp.id, TRUE FROM (VALUES
  ('Influenza (Flu)',              'General Physician'),
  ('Common Cold',                  'General Physician'),
  ('Migraine',                     'Neurologist'),
  ('Asthma',                       'Pulmonologist'),
  ('Type 2 Diabetes',              'Endocrinologist'),
  ('Hypertension',                 'Cardiologist'),
  ('Eczema (Atopic Dermatitis)',   'Dermatologist'),
  ('Gastritis',                    'Gastroenterologist'),
  ('Typhoid Fever',                'Infectious Disease'),
  ('Dengue Fever',                 'Infectious Disease'),
  ('Malaria',                      'Infectious Disease'),
  ('Tuberculosis',                 'Pulmonologist'),
  ('Pneumonia',                    'Pulmonologist'),
  ('GERD',                         'Gastroenterologist'),
  ('Irritable Bowel Syndrome',     'Gastroenterologist'),
  ('Anxiety Disorder',             'Psychiatrist'),
  ('Depression',                   'Psychiatrist'),
  ('Urinary Tract Infection',      'Urologist'),
  ('Kidney Stones',                'Urologist'),
  ('Anemia',                       'Hematologist'),
  ('Psoriasis',                    'Dermatologist'),
  ('Hypothyroidism',               'Endocrinologist'),
  ('Hyperthyroidism',              'Endocrinologist'),
  ('Rheumatoid Arthritis',         'Rheumatologist'),
  ('Osteoarthritis',               'Orthopedic Surgeon'),
  ('Chronic Kidney Disease',       'Nephrologist'),
  ('Conjunctivitis',               'Ophthalmologist'),
  ('Sinusitis',                    'ENT Specialist'),
  ('Appendicitis',                 'Emergency Medicine'),
  ('COVID-19',                     'General Physician')
) AS t(dname, spname)
JOIN diseases d ON d.name = t.dname
JOIN specializations sp ON sp.name = t.spname
ON CONFLICT (disease_id, specialization_id) DO NOTHING;

-- Bengaluru Doctors (real areas, realistic coordinates)
INSERT INTO doctors (name, specialization_id, clinic_name, location, address, area, city, phone, email, available, rating, experience_years, consultation_fee, latitude, longitude, languages, timings)
SELECT sp.id, * FROM (VALUES
  -- General Physicians
  ('Dr. Suresh Babu',        'General Physician',    'Bapu Clinic',              'Koramangala, Bengaluru',   '5th Block, Koramangala',      'Koramangala',   'Bengaluru', '+91 98450 11001', 'suresh.babu@healthmatch.in',   TRUE, 4.7, 18, 400,  12.9352, 77.6245, 'English, Kannada, Telugu', '9:00 AM - 8:00 PM'),
  ('Dr. Meena Krishnan',     'General Physician',    'Meena Health Centre',      'Indiranagar, Bengaluru',   '100 Feet Road, Indiranagar',  'Indiranagar',   'Bengaluru', '+91 98450 11002', 'meena.k@healthmatch.in',       TRUE, 4.8, 22, 450,  12.9784, 77.6408, 'English, Kannada, Tamil',  '8:30 AM - 7:00 PM'),
  ('Dr. Ravi Shankar',       'General Physician',    'City Medical Centre',      'Jayanagar, Bengaluru',     '4th Block, Jayanagar',        'Jayanagar',     'Bengaluru', '+91 98450 11003', 'ravi.shankar@healthmatch.in',  TRUE, 4.6, 15, 350,  12.9250, 77.5938, 'English, Kannada, Hindi',  '10:00 AM - 6:00 PM'),
  -- Pulmonologists
  ('Dr. Anitha Rao',         'Pulmonologist',        'Lung Care Speciality',     'HSR Layout, Bengaluru',    'Sector 2, HSR Layout',        'HSR Layout',    'Bengaluru', '+91 98450 12001', 'anitha.rao@healthmatch.in',    TRUE, 4.9, 20, 700,  12.9116, 77.6473, 'English, Kannada, Telugu', '9:00 AM - 5:00 PM'),
  ('Dr. Pradeep Menon',      'Pulmonologist',        'Breath & Life Clinic',     'Whitefield, Bengaluru',    'EPIP Zone, Whitefield',       'Whitefield',    'Bengaluru', '+91 98450 12002', 'pradeep.m@healthmatch.in',     TRUE, 4.7, 16, 650,  12.9698, 77.7500, 'English, Malayalam, Hindi','10:00 AM - 7:00 PM'),
  -- Neurologists
  ('Dr. Kavitha Subramanian', 'Neurologist',         'NeuroStar Clinic',         'JP Nagar, Bengaluru',      'Phase 3, JP Nagar',           'JP Nagar',      'Bengaluru', '+91 98450 13001', 'kavitha.s@healthmatch.in',     TRUE, 4.8, 24, 900,  12.9063, 77.5938, 'English, Tamil, Kannada',  '9:30 AM - 5:30 PM'),
  ('Dr. Sanjay Verma',       'Neurologist',          'BrainCare Institute',      'Malleshwaram, Bengaluru',  '18th Cross, Malleshwaram',    'Malleshwaram',  'Bengaluru', '+91 98450 13002', 'sanjay.v@healthmatch.in',      TRUE, 4.6, 19, 800,  13.0037, 77.5674, 'English, Hindi, Kannada',  '10:00 AM - 6:00 PM'),
  -- Dermatologists
  ('Dr. Priya Nair',         'Dermatologist',        'Skin Studio Dermatology',  'Koramangala, Bengaluru',   '1st Block, Koramangala',      'Koramangala',   'Bengaluru', '+91 98450 14001', 'priya.nair@healthmatch.in',    TRUE, 4.9, 14, 600,  12.9279, 77.6271, 'English, Malayalam, Kannada','9:00 AM - 7:00 PM'),
  ('Dr. Rohan Mehta',        'Dermatologist',        'DermaGlow Clinic',         'Indiranagar, Bengaluru',   '12th Main, Indiranagar',      'Indiranagar',   'Bengaluru', '+91 98450 14002', 'rohan.m@healthmatch.in',       TRUE, 4.7, 11, 550,  12.9716, 77.6412, 'English, Hindi, Gujarati', '11:00 AM - 8:00 PM'),
  -- Cardiologists
  ('Dr. Lakshmi Prasad',     'Cardiologist',         'Heart & Vascular Centre',  'Rajajinagar, Bengaluru',   'WOC Road, Rajajinagar',       'Rajajinagar',   'Bengaluru', '+91 98450 15001', 'lakshmi.p@healthmatch.in',     TRUE, 4.8, 28, 1200, 13.0025, 77.5497, 'English, Kannada, Telugu', '9:00 AM - 4:00 PM'),
  ('Dr. Arun Kumar',         'Cardiologist',         'Pulse Cardiac Clinic',     'Banashankari, Bengaluru',  '2nd Stage, Banashankari',     'Banashankari',  'Bengaluru', '+91 98450 15002', 'arun.k@healthmatch.in',        TRUE, 4.7, 21, 1100, 12.9340, 77.5460, 'English, Kannada, Tamil',  '10:00 AM - 5:00 PM'),
  -- Gastroenterologists
  ('Dr. Vijaya Murthy',      'Gastroenterologist',   'GutCare Digestive Centre', 'Basavanagudi, Bengaluru',  'Bull Temple Road, Basavanagudi','Basavanagudi', 'Bengaluru', '+91 98450 16001', 'vijaya.m@healthmatch.in',      TRUE, 4.8, 17, 750,  12.9417, 77.5738, 'English, Kannada, Telugu', '9:30 AM - 6:30 PM'),
  ('Dr. Sunil Bhat',         'Gastroenterologist',   'DigestoCare Clinic',       'Electronic City, Bengaluru','Phase 1, Electronic City',   'Electronic City','Bengaluru','+91 98450 16002', 'sunil.b@healthmatch.in',       TRUE, 4.6, 13, 700,  12.8399, 77.6770, 'English, Kannada, Tulu',   '10:00 AM - 7:00 PM'),
  -- Endocrinologists
  ('Dr. Nalini Sharma',      'Endocrinologist',      'HormoBalance Clinic',      'BTM Layout, Bengaluru',    '2nd Stage, BTM Layout',       'BTM Layout',    'Bengaluru', '+91 98450 17001', 'nalini.s@healthmatch.in',      TRUE, 4.9, 23, 850,  12.9165, 77.6101, 'English, Hindi, Marathi',  '9:00 AM - 5:00 PM'),
  ('Dr. Thomas George',      'Endocrinologist',      'ThyroMed Centre',          'Hebbal, Bengaluru',        'Outer Ring Road, Hebbal',     'Hebbal',        'Bengaluru', '+91 98450 17002', 'thomas.g@healthmatch.in',      TRUE, 4.7, 18, 800,  13.0358, 77.5970, 'English, Malayalam, Kannada','10:00 AM - 6:00 PM'),
  -- ENT Specialists
  ('Dr. Geeta Iyengar',      'ENT Specialist',       'SinusClear ENT Clinic',    'Malleshwaram, Bengaluru',  '15th Cross, Malleshwaram',    'Malleshwaram',  'Bengaluru', '+91 98450 18001', 'geeta.i@healthmatch.in',       TRUE, 4.8, 20, 500,  13.0055, 77.5627, 'English, Kannada, Tamil',  '9:00 AM - 7:00 PM'),
  -- Orthopedic Surgeons
  ('Dr. Harish Shenoy',      'Orthopedic Surgeon',   'BoneAndJoint Clinic',      'Jayanagar, Bengaluru',     '9th Block, Jayanagar',        'Jayanagar',     'Bengaluru', '+91 98450 19001', 'harish.s@healthmatch.in',      TRUE, 4.7, 25, 900,  12.9226, 77.5906, 'English, Kannada, Tulu',   '9:30 AM - 5:30 PM'),
  -- Rheumatologists
  ('Dr. Padma Reddy',        'Rheumatologist',       'Arthritis & Joints Centre','Koramangala, Bengaluru',   '3rd Block, Koramangala',      'Koramangala',   'Bengaluru', '+91 98450 20001', 'padma.r@healthmatch.in',       TRUE, 4.8, 16, 800,  12.9306, 77.6198, 'English, Telugu, Kannada', '10:00 AM - 6:00 PM'),
  -- Infectious Disease
  ('Dr. Krishnamurthy Rao',  'Infectious Disease',   'InfectoCare Clinic',       'Rajajinagar, Bengaluru',   '3rd Block, Rajajinagar',      'Rajajinagar',   'Bengaluru', '+91 98450 21001', 'krishna.r@healthmatch.in',     TRUE, 4.9, 30, 700,  12.9930, 77.5498, 'English, Kannada, Telugu', '9:00 AM - 4:00 PM'),
  ('Dr. Shilpa Desai',       'Infectious Disease',   'TropicMed Institute',      'Whitefield, Bengaluru',    'Prestige Tech Park, Whitefield','Whitefield',  'Bengaluru', '+91 98450 21002', 'shilpa.d@healthmatch.in',      TRUE, 4.7, 14, 650,  12.9806, 77.7470, 'English, Marathi, Kannada','10:00 AM - 7:00 PM'),
  -- Psychiatrists
  ('Dr. Venkatesh Iyer',     'Psychiatrist',         'MindCare Wellness',        'Indiranagar, Bengaluru',   '5th Cross, Indiranagar',      'Indiranagar',   'Bengaluru', '+91 98450 22001', 'venkatesh.i@healthmatch.in',   TRUE, 4.8, 19, 1000, 12.9781, 77.6403, 'English, Tamil, Hindi',    '10:00 AM - 6:00 PM'),
  -- Ophthalmologists
  ('Dr. Nandita Pillai',     'Ophthalmologist',      'VisionFirst Eye Centre',   'HSR Layout, Bengaluru',    'Sector 4, HSR Layout',        'HSR Layout',    'Bengaluru', '+91 98450 23001', 'nandita.p@healthmatch.in',     TRUE, 4.9, 17, 600,  12.9140, 77.6428, 'English, Malayalam, Kannada','9:30 AM - 6:30 PM'),
  -- Urologists
  ('Dr. Ashwin Kulkarni',    'Urologist',            'UroPlus Speciality',       'BTM Layout, Bengaluru',    '1st Stage, BTM Layout',       'BTM Layout',    'Bengaluru', '+91 98450 24001', 'ashwin.k@healthmatch.in',      TRUE, 4.7, 21, 800,  12.9182, 77.6088, 'English, Marathi, Kannada','9:00 AM - 5:00 PM'),
  -- Nephrologists
  ('Dr. Sujatha Raman',      'Nephrologist',         'KidneyCare Centre',        'Basavanagudi, Bengaluru',  '3rd Block, Basavanagudi',     'Basavanagudi',  'Bengaluru', '+91 98450 25001', 'sujatha.r@healthmatch.in',     TRUE, 4.8, 22, 900,  12.9430, 77.5762, 'English, Tamil, Kannada',  '10:00 AM - 5:00 PM'),
  -- Hematologists
  ('Dr. Deepak Joshi',       'Hematologist',         'BloodCare Institute',      'Rajajinagar, Bengaluru',   '2nd Block, Rajajinagar',      'Rajajinagar',   'Bengaluru', '+91 98450 26001', 'deepak.j@healthmatch.in',      TRUE, 4.7, 18, 750,  12.9975, 77.5560, 'English, Hindi, Kannada',  '9:30 AM - 5:30 PM'),
  -- Emergency Medicine
  ('Dr. Rashmi Nanjappa',    'Emergency Medicine',   'Apollo Emergency',         'Bannerghatta Road, Bengaluru','Bannerghatta Main Rd',      'Bannerghatta',  'Bengaluru', '+91 98450 27001', 'rashmi.n@healthmatch.in',      TRUE, 4.9, 26, 800,  12.8968, 77.5985, 'English, Kannada, Telugu', '24/7 Emergency'),
  -- Allergist
  ('Dr. Madhuri Kapoor',     'Allergist/Immunologist','AllergyFree Clinic',       'Koramangala, Bengaluru',   '7th Block, Koramangala',      'Koramangala',   'Bengaluru', '+91 98450 28001', 'madhuri.k@healthmatch.in',     TRUE, 4.6, 12, 600,  12.9383, 77.6196, 'English, Hindi, Kannada',  '10:00 AM - 7:00 PM')
) AS t(name, spname, clinic_name, location, address, area, city, phone, email, available, rating, experience_years, consultation_fee, latitude, longitude, languages, timings)
JOIN specializations sp ON sp.name = t.spname
ON CONFLICT DO NOTHING;