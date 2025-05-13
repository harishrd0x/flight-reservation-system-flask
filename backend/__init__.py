# backend/__init__.py

from flask import Flask
from backend.routes.auth_routes import auth_bp
from backend.routes.airplane_routes import airplane_bp
from backend.routes.airport_routes import airport_bp
from backend.routes.flight_routes import flight_bp
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
    app.register_blueprint(airplane_bp)
    app.register_blueprint(airport_bp)
    app.register_blueprint(flight_bp)

    # Register global exception handlers
    register_error_handlers(app)

    return app
