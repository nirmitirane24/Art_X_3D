# utils/db.py
import psycopg2
import os
from dotenv import load_dotenv
from pathlib import Path  # Import the Path class

# Construct the absolute path to your .env file
env_path = Path(__file__).resolve().parent.parent / '.env'  # Go up two levels
load_dotenv(dotenv_path=env_path)

def get_db_connection():
    """Establishes a connection to the Supabase database."""
    # Debugging prints (Keep these for now!)
    print(f"DB_HOST: {os.environ.get('SUPABASE_DB_HOST')}")
    print(f"DB_USER: {os.environ.get('SUPABASE_DB_USER')}")
    print(f"DB_PASSWORD: {os.environ.get('SUPABASE_DB_PASSWORD')}")
    print(f"DB_NAME: {os.environ.get('SUPABASE_DB_NAME')}")
    print(f"DB_PORT: {os.environ.get('SUPABASE_DB_PORT')}")

    try:
        conn = psycopg2.connect(
            host=os.environ.get('SUPABASE_DB_HOST'),
            user=os.environ.get('SUPABASE_DB_USER'),
            password=os.environ.get('SUPABASE_DB_PASSWORD'),
            database=os.environ.get('SUPABASE_DB_NAME'),
            port=int(os.environ.get('SUPABASE_DB_PORT', 5432)),
        )
        return conn
    except psycopg2.Error as e:
        print(f"Error connecting to PostgreSQL Database: {e}")
        return None

def create_tables():
    return True