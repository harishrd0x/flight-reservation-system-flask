# backend/routes/__init__.py
# Keeps blueprint registrations modular and scalable

# TODO: Register all blueprints here as they are added

from backend.routes.auth_routes import auth_bp

def register_blueprints(app):
    app.register_blueprint(auth_bp)

    # TODO: Later add user_bp, flight_bp, booking_bp, etc.