import sqlite3

def init_db():
    conn = sqlite3.connect('users.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS users
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT, password TEXT)''')
    conn.commit()
    conn.close()

def get_db_connection():
    conn = sqlite3.connect('users.db')
    return conn
