from flask import Flask
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from AuthFunctions.auth import create_auth_bp  # Import the correct function
from DB_functions.db import init_db, get_db_connection

app = Flask(__name__)
CORS(app)
bcrypt = Bcrypt(app)

# Initialize the database
init_db()

# Register Blueprints and pass the database connection function
app.register_blueprint(create_auth_bp(get_db_connection))

if __name__ == '__main__':
    app.run(debug=True)
