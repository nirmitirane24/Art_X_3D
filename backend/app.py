import os
from flask import Flask
from flask_cors import CORS
from config import DevelopmentConfig, ProductionConfig #
from routes.auth_routes import auth_bp             
from routes.user_routes import user_bp             
from routes.scene_routes import scene_bp           
from routes.library_routes import library_bp         

def create_app(config_class=DevelopmentConfig):

    app = Flask(__name__)
    app.config.from_object(config_class)
    app.config.update(
        SESSION_COOKIE_SECURE=True,
        SESSION_COOKIE_HTTPONLY=True,
        SESSION_COOKIE_SAMESITE='None',
        SESSION_PERMANENT=True
    )
    CORS(app,
         resources={r"/*": {"origins": "https://artx3d.vercel.app"}}, 
         supports_credentials=True) 

    app.register_blueprint(auth_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(scene_bp)
    app.register_blueprint(library_bp)

    @app.route('/')
    def index():
        return "Backend is running!"
    return app

if os.getenv('VERCEL_ENV') == 'production':
    app = create_app(ProductionConfig)
else:
    app = create_app(DevelopmentConfig)

if __name__ == '__main__':
    local_app = create_app(DevelopmentConfig)
    local_app.run(host='0.0.0.0', port=int(os.getenv('PORT', 5050)), debug=True)