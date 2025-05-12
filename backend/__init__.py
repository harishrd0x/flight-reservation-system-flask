from flask import Flask
from backend.routes.auth_routes import auth_bp
from backend.extensions import db, jwt  # Assuming extensions are initialized here
from backend.exceptions.error_handlers import register_error_handlers  # Your global handler

def create_app():
    app = Flask(__name__)

    # TODO: Load config here
    # app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)

    # Register Blueprints
    app.register_blueprint(auth_bp)

    # Register global exception handlers
    register_error_handlers(app)

    return app
