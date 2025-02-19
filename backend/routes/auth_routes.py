from flask import Blueprint, request, jsonify, session
from werkzeug.security import check_password_hash
from models import User
from utils.decorators import login_required

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')  # Get email from the request

    if not username or not password or not email:
        return jsonify({'message': 'Username, password, and email are required'}), 400

    existing_user = User.get_user_by_username(username)
    if existing_user:
        return jsonify({'message': 'Username already exists'}), 409

    # Create the user (password hashing is handled in the model)
    new_user = User.create_user(username, password, email) #pass email
    if new_user:
        return jsonify({'message': 'User registered successfully'}), 201
    else:
        return jsonify({'message': 'Registration failed'}), 500


@auth_bp.route('/signin', methods=['POST'])
def signin():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'message': 'Username and password are required'}), 400

    user = User.get_user_by_username(username)
    if user and user.check_password(password):
        session['username'] = user.username
        session.permanent = True
        return jsonify({'message': 'Login successful', 'username': user.username}), 200
    else:
        return jsonify({'message': 'Invalid credentials'}), 401


@auth_bp.route('/logout', methods=['POST'])
@login_required  
def logout():
    session.pop('username', None)
    return jsonify({'message': 'Logged out successfully'}), 200

# NEW ENDPOINT: Check Authentication
@auth_bp.route('/check', methods=['GET'])
def check_auth():
    if 'username' in session:
        return jsonify({'username': session['username']}), 200
    else:
        return jsonify({'message': 'Unauthorized'}), 401