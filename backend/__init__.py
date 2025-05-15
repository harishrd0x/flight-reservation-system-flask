# backend/__init__.py

from flask import Flask
from routes.auth_routes import auth_bp
from routes.airplane_routes import airplane_bp
from routes.airport_routes import airport_bp
from routes.flight_routes import flight_bp
from extensions import db, jwt  # Assuming extensions are initialized here
from exceptions.error_handlers import register_error_handlers  # Your global handler

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
