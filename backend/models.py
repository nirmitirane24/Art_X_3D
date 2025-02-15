import pymysql
from werkzeug.security import generate_password_hash, check_password_hash
from utils.db import get_db_connection  # <--- ABSOLUTE import

import pymysql
from werkzeug.security import generate_password_hash, check_password_hash
from utils.db import get_db_connection

class User:
    def __init__(self, id, username, password_hash=None, email=None): #email arg
        self.id = id
        self.username = username
        self.password_hash = password_hash
        self.email = email

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    @staticmethod
    def create_user(username, password, email): #email arg
        conn = get_db_connection()
        if conn is None:
            return None

        hashed_password = generate_password_hash(password)
        try:
            with conn.cursor() as cursor:
                # Modify the SQL to include the email
                cursor.execute("INSERT INTO users (username, password, email) VALUES (%s, %s, %s)",
                               (username, hashed_password, email))
                conn.commit()
                user_id = cursor.lastrowid
                return User(user_id, username, hashed_password, email) #pass email
        except pymysql.MySQLError as e:
            print(f"Error creating user: {e}")
            conn.rollback()
            return None
        finally:
            conn.close()

    @staticmethod
    def get_user_by_username(username):
        conn = get_db_connection()
        if conn is None:
            return None

        try:
            with conn.cursor(pymysql.cursors.DictCursor) as cursor:
                cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
                user_data = cursor.fetchone()
                if user_data:
                    # Include email in the returned User object
                    return User(user_data['id'], user_data['username'], user_data['password'], user_data['email'])
                return None
        except pymysql.MySQLError as e:
            print(f"Error getting user: {e}")
            return None
        finally:
            conn.close()

    @staticmethod
    def get_user_by_id(user_id):
      conn = get_db_connection()
      if conn is None:
          return None

      try:
          with conn.cursor(pymysql.cursors.DictCursor) as cursor:
              cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
              user_data = cursor.fetchone()
              if user_data:
                  return User(user_data['id'], user_data['username'], user_data['password'], user_data['email'])
              return None
      except pymysql.MySQLError as e:
            print(f"Error fetching user by ID: {e}")
            return None
      finally:
            conn.close()

class UserLog:  # Example model for user logs
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
            with conn.cursor(pymysql.cursors.DictCursor) as cursor:
                cursor.execute("SELECT * FROM user_logs WHERE user_id = %s ORDER BY timestamp DESC", (user_id,))
                logs_data = cursor.fetchall()
                logs = [UserLog(**log) for log in logs_data] #convert dict to UserLog objects
                return logs
        except pymysql.MySQLError as e:
            print(f"Error fetching user logs: {e}")
            return []
        finally:
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
                return True  # Or return the new log ID if needed
        except pymysql.MySQLError as e:
            print(f"Error creating user log: {e}")
            conn.rollback()
            return False
        finally:
            conn.close()