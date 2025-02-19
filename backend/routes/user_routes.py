from flask import Blueprint, jsonify, session
from models import User, UserLog  # Absolute import
from utils.decorators import login_required  # Absolute import

user_bp = Blueprint('user', __name__, url_prefix='/user')

@user_bp.route('/logs', methods=['GET'])
@login_required
def get_user_logs():
    username = session['username']
    user = User.get_user_by_username(username)
    if not user:
        return jsonify({'message': 'User not found'}), 404
    logs = UserLog.get_logs_by_user_id(user.id)
    log_list = [
        {
            'log_id': log.log_id,
            'user_id': log.user_id,
            'activity': log.activity,
            'timestamp': log.timestamp.isoformat(),
            'username': username
        } for log in logs
    ]
    return jsonify(log_list), 200
