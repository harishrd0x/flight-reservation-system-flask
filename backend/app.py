from flask import Flask
from backend.config import get_config_class
from backend.extensions import init_extensions
from backend.routes import register_blueprints  # You will create this soon
from backend.exceptions.handlers import register_error_handlers  # Centralized error handlers
import backend.utils.logging_config as logging_config  # Logging setup


def create_app(config_name="development"):
    app = Flask(__name__)

    app.logger.info("This should go to app.log")

    # Load config
    app.config.from_object(get_config_class(config_name))

    # Setup logging
    logging_config.init_logging(app)  # TODO: Customize log formats and handlers
    for handler in app.logger.handlers:
        app.logger.info(f"Handler: {handler}")

    app.logger.info("Logging initialized successfully")  # ← Add this line

    logger = logging.getLogger(__name__)
    print(logger.propagate)  # Should be True


    # Initialize extensions
    init_extensions(app)

    # Register blueprints
    register_blueprints(app)  # TODO: Add more blueprints as modules grow

    # Register global error handlers
    register_error_handlers(app)

    

    return app
