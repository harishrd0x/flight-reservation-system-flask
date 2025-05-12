from backend.config.config import get_config_class
from backend.extensions import init_extensions, db
from backend.routes import register_blueprints
from backend.exceptions.error_handlers import register_error_handlers
from backend.utils.logging_config import init_logging
from flask import Flask

def create_app(config_name="development"):
    app = Flask(__name__)

    # Load config (dev/test/prod)
    app.config.from_object(get_config_class(config_name))

    # Logging setup
    init_logging(app)
    app.logger.info("Logging initialized")

    # Initialize extensions
    init_extensions(app)

    # Register routes
    register_blueprints(app)

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
