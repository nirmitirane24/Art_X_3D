
import jwt
import datetime


def create_jwt_token(user_id,SECRET_KEY):
    token = jwt.encode({
        'user_id': user_id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)  # Token expires in 1 hour
    }, SECRET_KEY, algorithm='HS256')
    return token