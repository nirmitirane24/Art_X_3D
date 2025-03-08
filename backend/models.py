import psycopg2  # Import psycopg2 here
from werkzeug.security import generate_password_hash, check_password_hash
from utils.db import get_db_connection
import os
from dotenv import load_dotenv

load_dotenv()  # Ensure .env is loaded

class User:
    def __init__(self, id, username, password_hash=None, email=None):
        self.id = id
        self.username = username
        self.password_hash = password_hash
        self.email = email

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    @staticmethod
    def create_user(username, password, email):
        conn = get_db_connection()
        if conn is None:
            return None

        hashed_password = generate_password_hash(password)
        try:
            with conn.cursor() as cursor:
                cursor.execute("INSERT INTO users (username, password, email) VALUES (%s, %s, %s)",
                               (username, hashed_password, email))
                conn.commit()
                user_id = cursor.lastrowid  # This works with psycopg2
                return User(user_id, username, hashed_password, email)
        except psycopg2.Error as e:  # Catch psycopg2.Error
            print(f"Error creating user: {e}")
            conn.rollback()
            return None
        finally:
            if conn:  # Always check if conn exists before closing
                conn.close()

    @staticmethod
    def get_user_by_username(username):
        conn = get_db_connection()
        if conn is None:
            return None

        try:
            with conn.cursor() as cursor:  # Use default cursor (not DictCursor)
                cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
                user_data = cursor.fetchone()
                if user_data:
                    # Assuming the order of columns is id, username, password, email
                    return User(user_data[0], user_data[1], user_data[2], user_data[3])
                return None
        except psycopg2.Error as e:
            print(f"Error getting user: {e}")
            return None
        finally:
            if conn:
                conn.close()

    @staticmethod
    def get_user_by_id(user_id):
        conn = get_db_connection()
        if conn is None:
            return None

        try:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
                user_data = cursor.fetchone()
                if user_data:
                    return User(user_data[0], user_data[1], user_data[2], user_data[3])
                return None
        except psycopg2.Error as e:
            print(f"Error fetching user by ID: {e}")
            return None
        finally:
            if conn:
                conn.close()


class UserLog:
    def __init__(self, log_id, user_id, activity, timestamp):
        self.log_id = log_id
        self.user_id = user_id
        self.activity = activity
        self.timestamp = timestamp

    @staticmethod
    def get_logs_by_user_id(user_id):
        conn = get_db_connection()
        if conn is None:
            return []

        try:
            with conn.cursor() as cursor:  
                cursor.execute("SELECT * FROM user_logs WHERE user_id = %s ORDER BY timestamp DESC", (user_id,))
                logs_data = cursor.fetchall()
                logs = [UserLog(log[0], log[1], log[2], log[3]) for log in logs_data]
                return logs
        except psycopg2.Error as e:
            print(f"Error fetching user logs: {e}")
            return []
        finally:
            if conn:
                conn.close()

    @staticmethod
    def create_log(user_id, activity):
        conn = get_db_connection()
        if conn is None:
            return False

        try:
            with conn.cursor() as cursor:
                cursor.execute("INSERT INTO user_logs (user_id, activity) VALUES (%s, %s)", (user_id, activity))
                conn.commit()
                return True
        except psycopg2.Error as e:
            print(f"Error creating user log: {e}")
            conn.rollback()
            return False
        finally:
            if conn:
                conn.close()
class Scene: #create a scene model
    def __init__(self, scene_id, user_id, s3_bucket_name, s3_key, scene_name, created_at=None, updated_at=None):
        self.scene_id = scene_id
        self.user_id = user_id
        self.s3_bucket_name = s3_bucket_name
        self.s3_key = s3_key
        self.scene_name = scene_name
        self.created_at = created_at
        self.updated_at = updated_at