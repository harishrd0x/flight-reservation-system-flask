# backend/app.py

from flask import Flask
from config.config import get_config_class
from extensions.extensions import init_extensions  # ✅ Make sure this is from correct path
from routes import register_blueprints
from exceptions.handlers import register_error_handlers
from utils.logging_config import init_logging

def create_app(config_name="development"):
    app = Flask(__name__)

    # Load environment-specific config
    app.config.from_object(get_config_class(config_name))

    # Setup centralized logging
    init_logging(app)
    app.logger.info("Logging initialized successfully")

    # ✅ Initialize extensions like db, jwt, etc.
    init_extensions(app)

    # Register route blueprints
    register_blueprints(app)

    # Register centralized error handlers
    register_error_handlers(app)

    return app