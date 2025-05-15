# routes/booking_routes.py

import logging
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from schemas.booking_schemas import BookingSchema
from services.booking_service import BookingService
from utils.roles_required import role_required  # <-- Add this import

booking_bp = Blueprint("booking_bp", __name__, url_prefix="/api/bookings")
booking_schema = BookingSchema()
logger = logging.getLogger(__name__)

@booking_bp.route("/", methods=["POST"])
@jwt_required()
@role_required("USER")
def create_booking():
    user_id = get_jwt_identity()
    data = request.get_json()
    data["user_id"] = user_id
    validated_data = booking_schema.load(data)
    booking = BookingService.create_booking(validated_data)
    return booking_schema.dump(booking), 201

@booking_bp.route("/", methods=["GET"])
@jwt_required()
@role_required("ADMIN")
def get_all_bookings():
    bookings = BookingService.get_all_bookings()
    return jsonify(booking_schema.dump(bookings, many=True)), 200

@booking_bp.route("/user", methods=["GET"])
@jwt_required()
@role_required("USER")
def get_user_bookings():
    user_id = get_jwt_identity()
    bookings = BookingService.get_bookings_by_user(user_id)
    return jsonify(booking_schema.dump(bookings, many=True)), 200

@booking_bp.route("/<int:booking_id>", methods=["GET"])
@jwt_required()
def get_booking(booking_id):
    booking = BookingService.get_booking_by_id(booking_id)
    return booking_schema.dump(booking), 200

@booking_bp.route("/<int:booking_id>", methods=["DELETE"])
@jwt_required()
@role_required("USER")
def cancel_booking(booking_id):
    user_id = get_jwt_identity()
    BookingService.cancel_booking(booking_id, user_id)
    return jsonify({"message": "Booking cancelled successfully"}), 200
