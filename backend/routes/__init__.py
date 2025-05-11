from flask import Flask
from backend.routes.auth_routes import auth_bp

def register_blueprints(app: Flask):
    app.register_blueprint(auth_bp)
    # TODO: Register other blueprints (user, booking, etc.) here

