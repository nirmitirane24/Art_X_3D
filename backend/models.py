import psycopg2
from werkzeug.security import generate_password_hash, check_password_hash
from utils.db import get_db_connection
import os
from dotenv import load_dotenv

load_dotenv()  

class User:
    def __init__(self, id, username, password_hash=None, email=None, subscription_level='free'): 
        self.id = id
        self.username = username
        self.password_hash = password_hash
        self.email = email
        self.subscription_level = subscription_level 

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
                cursor.execute("INSERT INTO users (username, password, email) VALUES (%s, %s, %s) RETURNING id",
                               (username, hashed_password, email)) # Get user ID
                user_id = cursor.fetchone()[0] 

                cursor.execute("INSERT INTO subscriptions (user_id, subscription_level) VALUES (%s, %s)",
                               (user_id, 'free'))
                conn.commit()
                return User(user_id, username, hashed_password, email)
        except psycopg2.Error as e:  # Catch psycopg2.Error
            print(f"Error creating user: {e}")
            conn.rollback()
            return None
        finally:
            if conn:  
                conn.close()

    @staticmethod
    def get_user_by_username(username):
        conn = get_db_connection()
        if conn is None:
            return None

        try:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT u.*, s.subscription_level
                    FROM users u
                    LEFT JOIN subscriptions s ON u.id = s.user_id
                    WHERE u.username = %s
                    ORDER BY s.start_date DESC
                    LIMIT 1
                """, (username,))
                user_data = cursor.fetchone()
                if user_data:
                    return User(user_data[0], user_data[1], user_data[2], user_data[3], user_data[4])
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
                cursor.execute("""
                    SELECT u.*, s.subscription_level
                    FROM users u
                    LEFT JOIN subscriptions s ON u.id = s.user_id
                    WHERE u.id = %s
                    ORDER BY s.start_date DESC
                    LIMIT 1
                """, (user_id,))
                user_data = cursor.fetchone()
                if user_data:
                    return User(user_data[0], user_data[1], user_data[2], user_data[3], user_data[4])
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

class Subscription:
    def __init__(self, id, user_id, subscription_level, start_date, end_date, payment_id, auto_renew):
        self.id = id
        self.user_id = user_id
        self.subscription_level = subscription_level
        self.start_date = start_date
        self.end_date = end_date
        self.payment_id = payment_id
        self.auto_renew = auto_renew

    @staticmethod
    def create_subscription(user_id, subscription_level, payment_id, auto_renew=True, end_date=None):
        conn = get_db_connection()
        if conn is None:
            return False

        try:
            with conn.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO subscriptions (user_id, subscription_level, payment_id, auto_renew, end_date)
                    VALUES (%s, %s, %s, %s, %s)
                    """,
                    (user_id, subscription_level, payment_id, auto_renew, end_date)
                )
                conn.commit()
                return True
        except psycopg2.Error as e:
            print(f"Error creating subscription: {e}")
            conn.rollback()
            return False
        finally:
            if conn:
                conn.close()

    @staticmethod
    def update_subscription(payment_id, subscription_level, end_date=None, auto_renew=True):
        conn = get_db_connection()
        if conn is None:
            return False
        try:
            with conn.cursor() as cursor:
                cursor.execute(
                    """
                    UPDATE subscriptions 
                    SET subscription_level = %s, end_date = %s, auto_renew = %s
                    WHERE payment_id = %s
                    """,
                    (subscription_level, end_date, auto_renew, payment_id)
                )
                conn.commit()
                return True
        except psycopg2.Error as e:
            print(f"Error updating subscription: {e}")
            conn.rollback()
            return False
        finally:
            if conn:
                conn.close()
    @staticmethod
    def get_subscription_by_user_id(user_id):
        conn = get_db_connection()
        if conn is None:
            return None

        try:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT *
                    FROM subscriptions
                    WHERE user_id = %s
                    ORDER BY start_date DESC
                    LIMIT 1
                """, (user_id,))
                subscription_data = cursor.fetchone()
                if subscription_data:
                    return Subscription(subscription_data[0], subscription_data[1], subscription_data[2], subscription_data[3], subscription_data[4], subscription_data[5], subscription_data[6])
                return None
        except psycopg2.Error as e:
            print(f"Error getting subscription: {e}")
            return None
        finally:
            if conn:
                conn.close()