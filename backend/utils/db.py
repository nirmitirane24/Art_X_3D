import pymysql
from config import Config  # Absolute import
import os #for env usage
from dotenv import load_dotenv

load_dotenv()
def get_db_connection():
    """Establishes a connection to the AWS RDS database."""
    try:
        conn = pymysql.connect(
            host=os.environ.get('DB_HOST'),
            user=os.environ.get('DB_USER'),
            password=os.environ.get('DB_PASSWORD'),
            database=os.environ.get('DB_NAME'),
            port=int(os.environ.get('DB_PORT', 3306)),  # Ensure port is an integer
            cursorclass=pymysql.cursors.DictCursor
        )
        return conn
    except pymysql.MySQLError as e:
        print(f"Error connecting to MySQL Database: {e}")
        return None
    
def create_tables():
    """Creates the necessary tables if they don't exist."""
    conn = get_db_connection()
    if conn is None:
        return False
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(255) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    email VARCHAR(255) UNIQUE NOT NULL
                );
            """) #add email
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS user_logs (
                    log_id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT,
                    activity VARCHAR(255),
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id)
                );
            """)
            # Add Scenes Table Creation
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS Scenes (
                    scene_id INT PRIMARY KEY AUTO_INCREMENT,
                    user_id INT NOT NULL,
                    s3_bucket_name VARCHAR(255) NOT NULL,
                    s3_key VARCHAR(255) NOT NULL,
                    scene_name VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                );
            """)
            conn.commit()
            return True
    except pymysql.MySQLError as e:
        print(f"Error creating tables: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()