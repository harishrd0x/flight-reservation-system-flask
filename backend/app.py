from flask import Flask
from config.config import get_config_class
from extensions import db, jwt
from exceptions.error_handlers import register_error_handlers
from utils.logging_config import init_logging
from routes import auth_bp, airplane_bp, airport_bp, flight_bp  # import blueprints as required


def create_app(config_name="development"):
    app = Flask(__name__)

    # loading environment-specific configuration
    app.config.from_object(get_config_class(config_name))

    # setting up logging
    init_logging(app)
    app.logger.info("✅ Logging initialized")

    # initializing Flask extensions
    db.init_app(app)
    jwt.init_app(app)

    # registering blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(airplane_bp)
    app.register_blueprint(airport_bp)
    app.register_blueprint(flight_bp)

    # registering global error handlers
    register_error_handlers(app)

    return app


# --- Entry Point ---
if __name__ == "__main__":
    app = create_app()

    # creating all the tables
    with app.app_context():
        db.create_all()
        print("✅ All tables created successfully.")

    # running the server
    app.run(debug=True)
