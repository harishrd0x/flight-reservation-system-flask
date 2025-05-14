from flask import Blueprint
from routes.auth_routes import auth_bp
from routes.user_routes import user_bp
from routes.airplane_routes import airplane_bp
from routes.airport_routes import airport_bp
from routes.flight_routes import flight_bp
from routes.booking_routes import booking_bp
from routes.wallet_routes import wallet_bp
from routes.review_routes import review_bp
from routes.passenger_routes import passenger_bp

def register_blueprints(app):
    """Register all Flask Blueprints."""
    app.register_blueprint(auth_bp, url_prefix="/auth")      # Authentication & JWT
    app.register_blueprint(user_bp, url_prefix="/user")      # User management
    app.register_blueprint(airplane_bp, url_prefix="/airplanes")  # Airplane management
    app.register_blueprint(airport_bp, url_prefix="/airports")    # Airport management
    app.register_blueprint(flight_bp, url_prefix="/flights")      # Flight management
    app.register_blueprint(booking_bp, url_prefix="/bookings")    # Ticket booking & details
    app.register_blueprint(wallet_bp, url_prefix="/wallet")       # Wallet & transactions
    app.register_blueprint(review_bp, url_prefix="/reviews")      # Review & ratings
    app.register_blueprint(passenger_bp, url_prefix="/passengers") # Passenger details
