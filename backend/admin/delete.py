# delete.py
import os
import pymysql
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env

def get_db_connection():
    """Establishes a connection to the AWS RDS database."""
    try:
        conn = pymysql.connect(
            host=os.getenv('DB_HOST'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            database=os.getenv('DB_NAME'),
            port=int(os.getenv('DB_PORT', 3306)),  # Ensure port is an integer
            cursorclass=pymysql.cursors.DictCursor  # Return results as dictionaries
        )
        return conn
    except pymysql.MySQLError as e:
        print(f"Error connecting to MySQL Database: {e}")
        return None


def drop_tables():
    """Drops all tables in the database."""
    conn = get_db_connection()
    if conn is None:
        return False

    try:
        with conn.cursor() as cursor:
            # Get a list of all tables in the database
            cursor.execute("SHOW TABLES")
            tables = [table['Tables_in_' + os.getenv('DB_NAME')] for table in cursor.fetchall()]
            # Disable foreign key checks to avoid issues during table deletion
            cursor.execute("SET FOREIGN_KEY_CHECKS = 0")

            # Drop each table
            for table in tables:
                cursor.execute(f"DROP TABLE IF EXISTS {table}")
                print(f"Table '{table}' dropped.")


            # Re-enable foreign key checks
            cursor.execute("SET FOREIGN_KEY_CHECKS = 1")
            conn.commit()
            print("All tables dropped successfully.")
            return True

    except pymysql.MySQLError as e:
        print(f"Error dropping tables: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()

if __name__ == '__main__':
    if drop_tables():
        print("Database cleanup completed.")
    else:
        print("Database cleanup failed.")