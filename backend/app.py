from flask import Flask
from flask_cors import CORS
from config import DevelopmentConfig, ProductionConfig  # Absolute import
from routes.auth_routes import auth_bp  # Absolute import
from routes.user_routes import user_bp  # Absolute import
from routes.scene_routes import scene_bp  # NEW: Import the scene routes
from utils.db import create_tables


def create_app(config_class=DevelopmentConfig):
    app = Flask(__name__)
    app.config.from_object(config_class)
    CORS(app, supports_credentials=True)

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(scene_bp)  # NEW: Register the scene blueprint

    #create_tables() #remove

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(port=5050)