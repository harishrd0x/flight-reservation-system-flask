from flask import Blueprint, request, jsonify
from models.flight import Flight, FlightStatus, FlightPrice, FlightClass
from extensions import db
from datetime import datetime
from flask_jwt_extended import jwt_required, get_jwt

flight_bp = Blueprint("flight_bp", __name__, url_prefix="/flights")

def is_admin():
    """
    Returns True if the JWT token's claims indicate the user has an ADMIN role.
    It assumes your token includes a "role" claim.
    """
    claims = get_jwt()
    return claims.get("role", "").upper() == "ADMIN"

@flight_bp.route("/", methods=["POST"])
@jwt_required()
def create_flight():
    """
    Create a new flight.
    Only admin users can perform this action.
    
    Expected JSON payload:
    {
      "flight_name": "Flight 101",
      "airplane_id": 1,
      "source_airport_id": 1,
      "destination_airport_id": 2,
      "departure_time": "2025-05-12T08:00:00",
      "arrival_time": "2025-05-12T12:00:00",
      "status": "ACTIVE"
    }
    """
    if not is_admin():
        return jsonify({"error": "Unauthorized. Only admins can perform this action."}), 403

    data = request.get_json()
    
    try:
        departure_time = datetime.fromisoformat(data["departure_time"])
        arrival_time = datetime.fromisoformat(data["arrival_time"])
    except Exception:
        return jsonify({"error": "Invalid date format. Use ISO8601 format."}), 400

    status_value = data.get("status", "ACTIVE")
    try:
        status_enum = FlightStatus(status_value)
    except ValueError:
        return jsonify({
            "error": "Invalid status. Choose from ACTIVE, IN_PROGRESS, COMPLETED, CANCELLED."
        }), 400

    flight = Flight(
        flight_name=data.get("flight_name"),
        airplane_id=data.get("airplane_id"),
        source_airport_id=data.get("source_airport_id"),
        destination_airport_id=data.get("destination_airport_id"),
        departure_time=departure_time,
        arrival_time=arrival_time,
        flight_status=status_enum
    )
    db.session.add(flight)
    db.session.commit()

    return jsonify({
        "message": "Flight created successfully",
        "flight": flight.to_dict()
    }), 201

@flight_bp.route("/", methods=["GET"])
def get_flights():
    """
    Retrieve all flights.
    Accessible to both customers and admins.
    """
    flights = Flight.query.all()
    return jsonify([flight.to_dict() for flight in flights]), 200

@flight_bp.route("/prices", methods=["POST"])
@jwt_required()
def create_or_update_flight_price():
    """
    Create or update a flight price.
    Only admin users can perform this action.
    
    Expected JSON payload:
    {
      "flight_id": 1,
      "flight_class": "ECONOMY",  // or "BUSINESS"
      "price": 199.99
    }
    """
    if not is_admin():
        return jsonify({"error": "Unauthorized. Only admins can perform this action."}), 403

    data = request.get_json()
    flight_id = data.get("flight_id")
    flight_class_value = data.get("flight_class")
    price = data.get("price")

    if not all([flight_id, flight_class_value, price]):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        flight_class_enum = FlightClass(flight_class_value)
    except ValueError:
        return jsonify({"error": "Invalid flight class. Choose ECONOMY or BUSINESS."}), 400

    # Check if flight exists
    flight = Flight.query.get(flight_id)
    if not flight:
        return jsonify({"error": "Flight not found"}), 404

    # Check if a price record exists for this flight and class combination
    flight_price = FlightPrice.query.filter_by(
        flight_id=flight_id,
        flight_class=flight_class_enum
    ).first()

    if flight_price:
        # Update the existing record
        flight_price.price = price
        db.session.commit()
        return jsonify({
            "message": "Flight price updated successfully",
            "flight_price": flight_price.to_dict()
        }), 200
    else:
        # Create a new flight price record
        flight_price = FlightPrice(
            flight_id=flight_id,
            flight_class=flight_class_enum,
            price=price
        )
        db.session.add(flight_price)
        db.session.commit()
        return jsonify({
            "message": "Flight price created successfully",
            "flight_price": flight_price.to_dict()
        }), 201
