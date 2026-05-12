import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
import os

load_dotenv()

class Database:
    def __init__(self):
        self.conn = None
        self.cursor = None
        self.connect()

    def connect(self):
        try:
            self.conn = psycopg2.connect(
                host=os.getenv('DB_HOST', 'localhost'),
                port=os.getenv('DB_PORT', 5432),
                database=os.getenv('DB_NAME', 'symptom_doctor_db'),
                user=os.getenv('DB_USER', 'postgres'),
                password=os.getenv('DB_PASSWORD', 'postgres')
            )
            self.cursor = self.conn.cursor(cursor_factory=RealDictCursor)
        except Exception as e:
            print(f"Database connection failed: {e}")

    def query(self, sql, params=None):
        try:
            self.cursor.execute(sql, params)
            return self.cursor.fetchall()
        except Exception as e:
            print(f"Query error: {e}")
            return None

    def query_one(self, sql, params=None):
        try:
            self.cursor.execute(sql, params)
            return self.cursor.fetchone()
        except Exception as e:
            print(f"Query error: {e}")
            return None

    def execute(self, sql, params=None):
        try:
            self.cursor.execute(sql, params)
            self.conn.commit()
            return True
        except Exception as e:
            self.conn.rollback()
            print(f"Execute error: {e}")
            return False

    def get_diseases(self):
        sql = "SELECT id, name, description, severity_level FROM diseases ORDER BY name"
        return self.query(sql)

    def get_symptoms(self):
        sql = "SELECT id, name FROM symptoms ORDER BY name"
        return self.query(sql)

    def get_disease_symptoms(self, disease_id):
        sql = """
            SELECT s.id, s.name, ds.frequency
            FROM symptoms s
            JOIN disease_symptoms ds ON s.id = ds.symptom_id
            WHERE ds.disease_id = %s
        """
        return self.query(sql, (disease_id,))

    def get_doctors_by_specialization(self, specialization_id, limit=5):
        sql = """
            SELECT d.id, d.name, d.location, d.phone, d.email, d.rating, s.name as specialization
            FROM doctors d
            JOIN specializations s ON d.specialization_id = s.id
            WHERE d.specialization_id = %s AND d.available = TRUE
            ORDER BY d.rating DESC
            LIMIT %s
        """
        return self.query(sql, (specialization_id, limit))

    def get_specialization_for_disease(self, disease_id):
        sql = """
            SELECT s.id, s.name
            FROM specializations s
            JOIN disease_specialization ds ON s.id = ds.specialization_id
            WHERE ds.disease_id = %s
        """
        return self.query(sql, (disease_id,))

    def get_or_create_user(self, name, email):
        try:
            # Check if user exists
            user = self.query_one("SELECT id FROM users WHERE email = %s", (email,))
            if user:
                return user['id']
            
            # Create new user
            sql = "INSERT INTO users (name, email) VALUES (%s, %s) RETURNING id"
            self.cursor.execute(sql, (name, email))
            self.conn.commit()
            return self.cursor.fetchone()['id']
        except Exception as e:
            self.conn.rollback()
            print(f"Error creating user: {e}")
            return None

    def save_user_query(self, email, age, gender, symptoms, predicted_disease, confidence, severity, doctor_id):
        sql = """
            INSERT INTO user_queries (user_id, symptoms, predicted_disease, confidence_score, severity_level, recommended_doctor_id)
            VALUES ((SELECT id FROM users WHERE email = %s), %s, %s, %s, %s, %s)
            RETURNING id
        """
        try:
            self.cursor.execute(sql, (email, symptoms, predicted_disease, confidence, severity, doctor_id))
            self.conn.commit()
            return self.cursor.fetchone()['id']
        except Exception as e:
            self.conn.rollback()
            print(f"Error saving query: {e}")
            return None

    def get_user_history(self, user_email):
        sql = """
            SELECT uq.id, uq.symptoms, uq.predicted_disease, uq.confidence_score,
                   uq.severity_level, uq.created_at, d.name as doctor_name, d.location
            FROM user_queries uq
            LEFT JOIN doctors d ON uq.recommended_doctor_id = d.id
            WHERE uq.user_id = (SELECT id FROM users WHERE email = %s)
            ORDER BY uq.created_at DESC
            LIMIT 10
        """
        return self.query(sql, (user_email,))

    def close(self):
        if self.cursor:
            self.cursor.close()
        if self.conn:
            self.conn.close()

db = Database()
