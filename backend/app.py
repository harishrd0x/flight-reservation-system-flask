# backend/__init__.py

from backend.config.config import get_config_class
from backend.extensions import db, jwt
from backend.exceptions.error_handlers import register_error_handlers
from backend.utils.logging_config import init_logging
from flask import Flask
from backend.routes import auth_bp, airplane_bp, airport_bp, flight_bp  # Import blueprints here

def create_app(config_name="development"):
    app = Flask(__name__)

    # Load config (dev/test/prod)
    app.config.from_object(get_config_class(config_name))

    # Logging setup
    init_logging(app)
    app.logger.info("Logging initialized")

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(airplane_bp)
    app.register_blueprint(airport_bp)
    app.register_blueprint(flight_bp)

    # Register error handlers
    register_error_handlers(app)

    return app



# --- Entry Point ---
if __name__ == "__main__":
    app = create_app()

    # Manually create all tables from models
    with app.app_context():
        db.create_all()
        print("✅ All tables created successfully.")
    
    # Start server
    app.run(debug=True)
