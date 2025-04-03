import os
from flask import Flask, render_template
from flask_cors import CORS
from config import DevelopmentConfig, ProductionConfig
from routes.auth_routes import auth_bp
from routes.user_routes import user_bp
from routes.scene_routes import scene_bp
from routes.library_routes import library_bp
from routes.payment_routes import payment_bp
import redis

def create_app(config_class):
    app = Flask(__name__, static_folder="static", template_folder="templates")
    app.config.from_object(config_class)
    app.config.update(
        SESSION_COOKIE_SECURE=True,
        SESSION_COOKIE_HTTPONLY=True,
        SESSION_COOKIE_SAMESITE='None',
        SESSION_PERMANENT=True
    )

    origins = ["https://artx3d.vercel.app"] if os.getenv('VERCEL_ENV') == 'production' else ["http://localhost:5173"]
    CORS(app, resources={r"/*": {"origins": origins}}, supports_credentials=True)

    redis_url = os.environ.get('REDIS_URL')
    app.redis = redis.Redis.from_url(redis_url) if redis_url else None

    app.register_blueprint(auth_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(scene_bp)
    app.register_blueprint(library_bp)
    app.register_blueprint(payment_bp)

    @app.route('/')
    def index():
        visits = app.redis.incr('visits') if app.redis else "Redis not connected"
        return render_template('index.html', visits=visits)  

    return app

config_class = ProductionConfig if os.getenv('VERCEL_ENV') == 'production' else DevelopmentConfig
app = create_app(config_class)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.getenv('PORT', 5050)), debug=True)