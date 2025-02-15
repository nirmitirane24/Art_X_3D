# show_table_content.py
import os
import sys  # Import the sys module
import pymysql
from dotenv import load_dotenv

load_dotenv()

def get_db_connection():
    """Establishes a connection to the AWS RDS database."""
    try:
        conn = pymysql.connect(
            host=os.getenv('DB_HOST'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            database=os.getenv('DB_NAME'),
            port=int(os.getenv('DB_PORT', 3306)),
            cursorclass=pymysql.cursors.DictCursor
        )
        return conn
    except pymysql.MySQLError as e:
        print(f"Error connecting to MySQL Database: {e}")
        return None

def show_table_content(table_name):
    """Displays the content of the specified table."""
    conn = get_db_connection()
    if conn is None:
        print("Failed to connect to the database.")
        return

    try:
        with conn.cursor() as cursor:
            # Sanitize the table name to prevent SQL injection (basic)
            #  In a real application, use parameterized queries!
            allowed_tables = get_allowed_tables(conn) #get list of tables
            if table_name not in allowed_tables:
                print(f"Error: Table '{table_name}' not found or access denied.")
                return

            # Fetch table content
            cursor.execute(f"SELECT * FROM `{table_name}`")  # Use backticks for safety
            rows = cursor.fetchall()

            if not rows:
                print(f"Table '{table_name}' is empty.")
                return

            # Get column names
            cursor.execute(f"SHOW COLUMNS FROM `{table_name}`")
            columns = [col['Field'] for col in cursor.fetchall()]

            # Print header
            print("| " + " | ".join(columns) + " |")
            print("|" + "---|" * len(columns))

            # Print rows
            for row in rows:
                row_values = [str(row[col]) for col in columns]
                print("| " + " | ".join(row_values) + " |")

    except pymysql.MySQLError as e:
        print(f"Error: {e}")  # More specific error
    finally:
        conn.close()

def get_allowed_tables(conn):
    """Gets a list of allowed table names to prevent SQL injection."""
    try:
        with conn.cursor() as cursor:
            cursor.execute("SHOW TABLES")
            tables = [table['Tables_in_' + os.getenv('DB_NAME')] for table in cursor.fetchall()]
            return tables
    except pymysql.MySQLError:
        return [] # Return empty in case of errors

def list_tables():
    """Lists all tables in the database and prints them to the console."""
    conn = get_db_connection()
    if conn is None:
        print("Failed to connect to the database.")
        return

    try:
        with conn.cursor() as cursor:
            cursor.execute("SHOW TABLES")
            tables = cursor.fetchall()

            if tables:
                print("Tables in the database:")
                for table in tables:
                    # Construct the table name correctly
                    table_name_key = 'Tables_in_' + os.getenv('DB_NAME')
                    print(f"- {table[table_name_key]}")
            else:
                print("No tables found in the database.")

    except pymysql.MySQLError as e:
        print(f"Error listing tables: {e}")
    finally:
        conn.close()

if __name__ == '__main__':
    if len(sys.argv) > 1: #check for table name argument
        table_name = sys.argv[1]  # Get the table name from command-line arguments
        show_table_content(table_name)
    else:
        list_tables() #show list if no arg provided
        print("Usage: python show_table_content.py <table_name>")
        print("Or: python show_table_content.py (to list available tables)")