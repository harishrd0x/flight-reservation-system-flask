# app.py
from flask import Flask
import enum
from flask.json.provider import DefaultJSONProvider
from config import Config
from flask_cors import CORS
from extensions import init_extensions, db
from routes import register_blueprints
from flasgger import Swagger
from exceptions.handlers import register_error_handlers
from utils.logging_config import setup_logging

# Custom JSON provider for enums
class CustomJSONProvider(DefaultJSONProvider):
    def default(self, obj):
        if isinstance(obj, enum.Enum):
            return obj.value
        return super().default(obj)

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    setup_logging(log_file_path="logs/app.log")
    
    # Use our custom JSON provider.
    app.json_provider_class = CustomJSONProvider
    app.json = app.json_provider_class(app)
    
    # Disable strict trailing slash enforcement to avoid redirecting OPTIONS preflight.
    app.url_map.strict_slashes = False
    
    # Configure CORS to allow requests from your frontend.
    CORS(app, resources={r"/*": {"origins": "http://localhost:8080"}}, supports_credentials=True)
    
    # Set up Swagger documentation.
    swagger_template = {
        "swagger": "2.0",
        "info": {
            "title": "Flight Reservation API",
            "description": "API for Flight Reservation Application",
            "version": "1.0.0",
        },
        "basePath": "/"
    }
    Swagger(app, template=swagger_template)
    
    init_extensions(app)
    with app.app_context():
        db.create_all()
    
    register_blueprints(app)
    register_error_handlers(app)
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
