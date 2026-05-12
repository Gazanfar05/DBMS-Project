# 🚀 Installation & Setup Guide

## ✅ All Files Created Successfully!

### 📁 Project Structure
```
DBMS project/
├── backend/
│   ├── app.py                    # Flask API server
│   ├── database.py               # Database operations
│   ├── ml_model.py               # ML predictions
│   ├── train_model.py            # Model training
│   ├── requirements.txt          # Python packages
│   ├── .env                      # Database config
│   └── .gitignore
│
├── frontend/
│   ├── package.json              # React config
│   ├── public/index.html         # HTML entry
│   ├── src/
│   │   ├── App.js                # Main app
│   │   ├── index.js              # React entry
│   │   ├── index.css             # Styles
│   │   └── components/
│   │       ├── SymptomChecker.js
│   │       ├── DoctorCard.js
│   │       └── History.js
│   ├── .env                      # API config
│   └── .gitignore
│
├── database/
│   └── schema.sql                # PostgreSQL schema
│
└── readme.md                     # Project README
```

---

## 🔧 Step-by-Step Setup

### Step 1: PostgreSQL Database Setup

```bash
# Create database
createdb symptom_doctor_db

# Import schema
psql symptom_doctor_db < database/schema.sql

# Verify (optional)
psql symptom_doctor_db -c "SELECT COUNT(*) FROM doctors;"
```

### Step 2: Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate          # Mac/Linux
# OR
venv\Scripts\activate.bat         # Windows

# Install dependencies
pip install -r requirements.txt

# Train ML model (creates models/ directory)
python train_model.py

# Start Flask server
python app.py
```

**Expected Output:**
```
 * Running on http://127.0.0.1:5000
 * Press CTRL+C to quit
```

✅ Backend ready at `http://localhost:5000`

### Step 3: Frontend Setup

**Open a NEW terminal** and run:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start React development server
npm start
```

**Expected Output:**
```
Compiled successfully!
You can now view symptom-doctor-recommender in the browser.
```

✅ Frontend ready at `http://localhost:3000`

---

## 🧪 Testing the Application

1. **Open browser**: http://localhost:3000

2. **Fill in form**:
   - Name: John Doe
   - Email: john@example.com
   - Age: 30
   - Gender: Male

3. **Select symptoms**:
   - Cough
   - Fever
   - Headache

4. **Click "Get Prediction"**

5. **View results**:
   - Disease prediction
   - Confidence score
   - Severity level
   - Recommended doctors

---

## 📱 API Testing (Optional)

Test the API endpoints directly:

```bash
# Get symptoms
curl -X GET http://localhost:5000/api/symptoms

# Make prediction
curl -X POST http://localhost:5000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "symptoms": ["Cough", "Fever", "Headache"],
    "age": 30,
    "gender": "M"
  }'

# Health check
curl -X GET http://localhost:5000/api/health
```

---

## ⚠️ Troubleshooting

### "Connection refused" error
```bash
# Check PostgreSQL is running
pg_isready

# If not running, start PostgreSQL
# Mac:
brew services start postgresql
# Windows:
# Use PostgreSQL pgAdmin

# Create database again
createdb symptom_doctor_db
psql symptom_doctor_db < database/schema.sql
```

### "ModuleNotFoundError: No module named 'flask'"
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

### "Cannot find module 'react'"
```bash
cd frontend
npm install
```

### ML model not found
```bash
cd backend
python train_model.py
```

### Port 5000 or 3000 already in use
```bash
# Find and kill process on port 5000
lsof -i :5000
kill -9 <PID>

# Or use different port
python app.py --port 5001
```

---

## 🎯 Quick Commands Reference

| Action | Command |
|--------|---------|
| Start Backend | `cd backend && source venv/bin/activate && python app.py` |
| Start Frontend | `cd frontend && npm start` |
| Train Model | `cd backend && python train_model.py` |
| Setup Database | `createdb symptom_doctor_db && psql symptom_doctor_db < database/schema.sql` |
| View Database | `psql symptom_doctor_db` |
| Stop Backend | `Press CTRL+C` |
| Stop Frontend | `Press CTRL+C` |
| Deactivate Venv | `deactivate` |
| Install Python Deps | `pip install -r requirements.txt` |
| Install Node Deps | `npm install` |

---

## 📊 Database Credentials

File: `backend/.env`

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=symptom_doctor_db
DB_USER=postgres
DB_PASSWORD=postgres
```

⚠️ **Change password for production!**

---

## 🌐 API Configuration

File: `frontend/.env`

```env
REACT_APP_API_URL=http://localhost:5000/api
```

For production: Update to your deployed backend URL

---

## 📦 Default Data

**8 Diseases**: Flu, Common Cold, Migraine, Asthma, Diabetes, Hypertension, Eczema, Gastritis

**10 Symptoms**: Cough, Fever, Headache, Shortness of Breath, Chest Pain, Nausea, Skin Rash, Muscle Pain, Fatigue, Itching

**8 Specialties**: Cardiologist, Dermatologist, Gastroenterologist, Neurologist, Pulmonologist, Ophthalmologist, Rheumatologist, Infectious Disease Specialist

**6 Sample Doctors**: Pre-populated with ratings and contact info

---

## ✨ Features Ready to Use

✅ Symptom-based disease prediction  
✅ AI confidence scoring  
✅ Severity assessment  
✅ Doctor recommendations  
✅ Query history tracking  
✅ Beautiful responsive UI  
✅ Real-time predictions  
✅ Database integration  

---

## 📱 Access Points

| Component | URL |
|-----------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000/api |
| Database | localhost:5432 |

---

## 🎓 Learn More

- **Frontend**: See `frontend/src/components/` for React components
- **Backend**: See `backend/app.py` for API endpoints
- **Database**: See `database/schema.sql` for schema details
- **ML**: See `backend/ml_model.py` for prediction logic

---

## 🚀 Next Steps

1. ✅ Run the application
2. 📝 Test with sample symptoms
3. 🔍 Check API responses
4. 💾 View saved history
5. 📊 Explore the database

---

## 📞 Support

All files are created and ready to use!
- Check error messages in terminal
- Review browser console (F12)
- Check `readme.md` for project info

**Ready to launch! 🎉**
