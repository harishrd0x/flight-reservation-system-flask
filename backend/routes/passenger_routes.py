from flask import Blueprint, request, jsonify
from models.passenger import Passenger
from extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity

passenger_bp = Blueprint("passenger", __name__)

@passenger_bp.route("/", methods=["GET"])
@jwt_required()
def get_passengers():
    """
    Get all passengers. You might filter this by booking ID or authenticated user as needed.
    """
    passengers = Passenger.query.all()
    return jsonify([passenger.to_dict() for passenger in passengers]), 200

@passenger_bp.route("/", methods=["POST"])
@jwt_required()
def add_passenger():
    """
    Add a new passenger to a booking.
    """
    data = request.json

    passenger = Passenger(
        booking_id=data.get("booking_id"),
        name=data.get("name"),
        age=data.get("age"),
        passport_number=data.get("passport_number")
    )
    db.session.add(passenger)
    db.session.commit()

    return jsonify({"message": "Passenger added", "passenger": passenger.to_dict()}), 201
