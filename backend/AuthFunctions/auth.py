from flask import Blueprint, request, jsonify
from flask_bcrypt import Bcrypt
from .createToken import create_jwt_token
SECRET_KEY = 'your_secret_key'
bcrypt = Bcrypt()

# Secret key for JWT encoding and decoding
  # Change this to a secure key in production

def create_auth_bp(get_db_connection):
    auth_bp = Blueprint('auth', __name__)

    # Function to create a JWT token
    # def create_jwt_token(user_id):
    #     token = jwt.encode({
    #         'user_id': user_id,
    #         'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)  # Token expires in 1 hour
    #     }, SECRET_KEY, algorithm='HS256')
    #     return token

    # Register endpoint
    @auth_bp.route('/register', methods=['POST'])
    def register():
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        # Check if user already exists
        conn = get_db_connection()
        c = conn.cursor()
        c.execute('SELECT * FROM users WHERE email = ?', (email,))
        if c.fetchone():
            return jsonify({"message": "User already exists"}), 400

        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
        c.execute('INSERT INTO users (email, password) VALUES (?, ?)', (email, hashed_password))
        conn.commit()
        conn.close()

        return jsonify({"message": "Registration successful"}), 201

    # Login endpoint
    @auth_bp.route('/login', methods=['POST'])
    def login():
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        conn = get_db_connection()
        c = conn.cursor()
        c.execute('SELECT * FROM users WHERE email = ?', (email,))
        user = c.fetchone()
        conn.close()

        if not user or not bcrypt.check_password_hash(user[2], password):
            return jsonify({"message": "Login failed"}), 401

        # Generate JWT token for the user
        token = create_jwt_token(user[0],SECRET_KEY)  # Assuming user[0] is the user_id
        return jsonify({"message": "Login successful", "token": token}), 200

    return auth_bp