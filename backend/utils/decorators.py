# utils/decorators.py
from functools import wraps
from flask import session, jsonify, request

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'username' not in session:
            print(f"Unauthorized request to {request.path}. Session: {session}")  # LOGGING
            return jsonify({'message': 'Unauthorized'}), 401
        return f(*args, **kwargs)
    return decorated_function