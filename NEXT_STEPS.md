# 🚀 Next Steps - Run Your Application

## ✅ Completed
- ✅ PostgreSQL installed and running
- ✅ Database created (symptom_doctor_db)
- ✅ Schema imported with sample data
- ✅ All project files created

## 🔧 Step 1: Setup Backend

**Open Terminal 1 and run:**

```bash
cd "/Users/gazanfar/DBMS project/backend"

# Create Python virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Train ML model (this takes ~30 seconds)
python train_model.py

# Start Flask server
python app.py
```

**Expected output:**
```
 * Running on http://127.0.0.1:5000
```

✅ Backend ready at `http://localhost:5000/api`

---

## 🎨 Step 2: Setup Frontend

**Open a NEW Terminal 2 and run:**

```bash
cd "/Users/gazanfar/DBMS project/frontend"

# Install dependencies
npm install

# Start React app
npm start
```

**Expected output:**
```
Compiled successfully!
You can now view the app in the browser.
```

✅ Frontend ready at `http://localhost:3000`

---

## 🧪 Test the Application

1. **Open browser**: http://localhost:3000

2. **Fill the form**:
   - Name: John Doe
   - Email: john@test.com
   - Age: 30
   - Gender: Male

3. **Select symptoms** (click 3 or more):
   - Cough
   - Fever
   - Headache

4. **Click "Get Prediction"**

5. **See results**:
   - Disease name
   - Confidence score
   - Severity level
   - Recommended doctors

---

## 📱 Verify Database

**In Terminal 3, verify data:**

```bash
psql symptom_doctor_db

# View doctors
SELECT * FROM doctors;

# View diseases  
SELECT * FROM diseases;

# Exit with \q
```

---

## 🛑 Stop Services

When done, press `CTRL+C` in each terminal to stop:
- Frontend (Ctrl+C)
- Backend (Ctrl+C)

---

## ⚠️ Troubleshooting

### "ModuleNotFoundError" in backend
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

### "Cannot find module" in frontend
```bash
cd frontend
npm install
```

### Database connection error
```bash
# Check if PostgreSQL is running
brew services list

# Start if needed
brew services start postgresql@15
```

### Port already in use
```bash
# Find process using port 5000
lsof -i :5000

# Kill it
kill -9 <PID>
```

---

## 🎯 Commands Quick Reference

| What | Command |
|------|---------|
| Start Backend | `cd backend && source venv/bin/activate && python app.py` |
| Start Frontend | `cd frontend && npm start` |
| Access Frontend | http://localhost:3000 |
| Access API | http://localhost:5000/api |
| Verify Database | `psql symptom_doctor_db -c "SELECT * FROM doctors;"` |
| Deactivate Venv | `deactivate` |

---

## ✨ Features Available

✅ Symptom-based disease prediction
✅ AI confidence scoring  
✅ Doctor recommendations
✅ Query history tracking
✅ Beautiful responsive UI
✅ 8 diseases + 10 symptoms
✅ 6 sample doctors

---

## 📊 Sample Data Included

**Diseases**: Flu, Cold, Migraine, Asthma, Diabetes, Hypertension, Eczema, Gastritis

**Doctors**: 
- Dr. Sarah Johnson (Pulmonologist, NY) - 4.8⭐
- Dr. Michael Chen (Neurologist, LA) - 4.7⭐
- Dr. Emily Rodriguez (Dermatologist, Chicago) - 4.9⭐
- And 3 more...

---

## 🎉 Ready to Go!

Your application is fully set up and ready to use!

1. Open Terminal 1 → Start Backend
2. Open Terminal 2 → Start Frontend  
3. Open Browser → http://localhost:3000
4. Have fun! 🚀

---

Any issues? Check the terminal output for error messages.
