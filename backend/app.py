from flask import Flask
import enum
from flask.json.provider import DefaultJSONProvider
from config import Config
from flask_cors import CORS
from extensions import init_extensions, db
from routes import register_blueprints
from flasgger import Swagger

# Custom JSON provider for Flask that converts enums to their value
class CustomJSONProvider(DefaultJSONProvider):
    def default(self, obj):
        if isinstance(obj, enum.Enum):
            return obj.value
        return super().default(obj)

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Set up our custom JSON provider
    app.json_provider_class = CustomJSONProvider
    app.json = app.json_provider_class(app)
    
    # Configure global CORS using settings from the config,
    # and allow credentials if needed.
    CORS(app, origins=app.config.get("CORS_ORIGINS"), supports_credentials=True)
    
    # Set up Swagger documentation
    swagger_template = {
        "swagger": "2.0",
        "info": {
            "title": "Flight Reservation API",
            "description": "API for Flight Reservation Application",
            "version": "1.0.0"
        },
        "basePath": "/"
    }
    Swagger(app, template=swagger_template)
    
    # Initialize extensions (SQLAlchemy, JWT, etc.)
    init_extensions(app)
    
    with app.app_context():
        db.create_all()
    
    # Register blueprints for endpoints
    register_blueprints(app)
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
