# auth_routes.py
from flask import Blueprint, request, jsonify, session, current_app
from werkzeug.security import check_password_hash
from models import User  # Assuming you have a User model
from utils.decorators import login_required  # Assuming you have a login_required decorator
import logging

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

logging.basicConfig(level=logging.INFO)  # Configure logging

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')  

    if not username or not password or not email:
        return jsonify({'message': 'Username, password, and email are required'}), 400

    existing_user = User.get_user_by_username(username)
    if existing_user:
        return jsonify({'message': 'Username already exists'}), 409

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

        if current_app.redis:
            try:
                current_app.redis.set(f"last_login:{username}", "now")
                current_app.redis.set(f"subscription_level:{username}", user.subscription_level)

                logging.info(f"User {username} logged in.  Last login/subscription saved to Redis.")
            except Exception as e:
                logging.error(f"Error saving login/subscription to Redis: {e}")

        return jsonify({'message': 'Login successful', 'username': user.username, 'subscription_level': user.subscription_level}), 200
    else:
        return jsonify({'message': 'Invalid credentials'}), 401


@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    username = session.get('username')
    session.pop('username', None)

    if current_app.redis:
        try:
            current_app.redis.delete(f"last_login:{username}")
            current_app.redis.delete(f"subscription_level:{username}") 

            logging.info(f"User {username} logged out.  Login info removed from Redis.")
        except Exception as e:
            logging.error(f"Error deleting login info from Redis: {e}")

    return jsonify({'message': 'Logged out successfully'}), 200


@auth_bp.route('/check', methods=['GET'])
def check_auth():
    if 'username' in session:
        username = session['username']
        user = User.get_user_by_username(username)
        if user:
            if current_app.redis:
                try:
                    subscription_level = current_app.redis.get(f"subscription_level:{username}")
                    if subscription_level:
                        subscription_level = subscription_level.decode('utf-8') #decode byte to string
                        logging.info(f"Subscription level retrieved from cache for {username}")
                        return jsonify({'username': username,  'subscription_level': subscription_level}), 200
                except Exception as e:
                    logging.error(f"Error retrieving subscription level from cache: {e}")

            return jsonify({'username': username,  'subscription_level': user.subscription_level}), 200
        else:
            return jsonify({'message': 'Unauthorized'}), 401
    else:
        return jsonify({'message': 'Unauthorized'}), 401