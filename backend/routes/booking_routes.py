import logging
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.orm import aliased

from extensions import db  # import your SQLAlchemy db instance
from services.booking_service import BookingService
from models.airport import Airport
from models.booking import Booking
from models.user import User
from models.flight import Flight


booking_bp = Blueprint("booking", __name__)

@booking_bp.route("/book_flight", methods=["POST"])
@jwt_required()
def book_flight():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON data provided"}), 400

    user_id_raw = get_jwt_identity()
    try:
        user_id = int(user_id_raw)
    except ValueError:
        return jsonify({"error": "Invalid user identity in token"}), 400

    flight_id = data.get("flight_id")
    seat_class_str = data.get("seat_class")
    if not flight_id or not seat_class_str:
        return jsonify({"error": "Missing required fields"}), 400

    try:
        booking = BookingService.create_booking(user_id, flight_id, seat_class_str)
        return jsonify({"message": "Booking created", "booking": booking.to_dict()}), 201
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except LookupError as le:
        return jsonify({"error": str(le)}), 404
    except Exception as e:
        return jsonify({"error": "Booking creation failed", "details": str(e)}), 500


@booking_bp.route("/confirm/<int:booking_id>", methods=["PUT"])
def confirm_booking(booking_id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON data provided"}), 400

    if data.get("payment_status") != "PAID":
        return jsonify({"error": "Payment status not confirmed. Cannot update booking."}), 400

    try:
        booking, wallet = BookingService.confirm_booking(booking_id)
        return jsonify({
            "message": "Booking confirmed and wallet debited",
            "booking": booking.to_dict(),
            "wallet": wallet.to_dict()
        }), 200
    except LookupError as le:
        return jsonify({"error": str(le)}), 404
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        return jsonify({"error": "Failed to confirm booking", "details": str(e)}), 500


@booking_bp.route("/cancel/<int:booking_id>", methods=["PUT"])
def cancel_booking(booking_id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON data provided"}), 400

    new_status = data.get("status", "")
    try:
        booking, wallet = BookingService.cancel_booking(booking_id, new_status)
        return jsonify({
            "message": "Booking cancelled and refund processed (if applicable)",
            "booking": booking.to_dict(),
            "wallet": wallet.to_dict() if wallet else None
        }), 200
    except LookupError as le:
        return jsonify({"error": str(le)}), 404
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        return jsonify({"error": "Failed to cancel booking", "details": str(e)}), 500


@booking_bp.route("/", methods=["GET"])
def get_all_bookings():
    try:
        SourceAirport = aliased(Airport)
        DestAirport = aliased(Airport)
        records = (
            db.session.query(Booking, User, Flight, SourceAirport, DestAirport)
            .join(User, Booking.user_id == User.id)
            .join(Flight, Booking.flight_id == Flight.id)
            .join(SourceAirport, Flight.source_airport_id == SourceAirport.id)
            .join(DestAirport, Flight.destination_airport_id == DestAirport.id)
            .order_by(Booking.created_at.desc())
            .all()
        )
        output = []
        for booking, user, flight, source_airport, dest_airport in records:
            output.append({
                "id": booking.id,
                "user_id": booking.user_id,
                "user_name": user.name,
                "flight_id": booking.flight_id,
                "seat_class": booking.seat_class,
                "booking_price": booking.booking_price,
                "booking_status": booking.booking_status,
                "created_at": booking.created_at.isoformat() if booking.created_at else None,
                "from": source_airport.city,
                "fromCode": source_airport.code,
                "to": dest_airport.city,
                "toCode": dest_airport.code,
                "departureDate": flight.departure_time.strftime("%Y-%m-%d") if flight.departure_time else None,
                "departureTime": flight.departure_time.strftime("%H:%M:%S") if flight.departure_time else None,
                "arrivalDate": flight.arrival_time.strftime("%Y-%m-%d") if flight.arrival_time else None,
                "arrivalTime": flight.arrival_time.strftime("%H:%M:%S") if flight.arrival_time else None,
            })
        return jsonify(output), 200
    except Exception as e:
        logging.exception("Error fetching all bookings:")
        return jsonify({"error": "Failed to fetch bookings", "details": str(e)}), 500


@booking_bp.route("/user/<string:identifier>", methods=["GET"])
def get_user_bookings(identifier):
    try:
        SourceAirport = aliased(Airport)
        DestAirport = aliased(Airport)
        records = (
            db.session.query(Booking, User, Flight, SourceAirport, DestAirport)
            .join(User, Booking.user_id == User.id)
            .join(Flight, Booking.flight_id == Flight.id)
            .join(SourceAirport, Flight.source_airport_id == SourceAirport.id)
            .join(DestAirport, Flight.destination_airport_id == DestAirport.id)
            .filter(User.email == identifier)
            .order_by(Booking.created_at.desc())
            .all()
        )
        output = []
        for booking, user, flight, source_airport, dest_airport in records:
            output.append({
                "id": booking.id,
                "user_id": booking.user_id,
                "user_name": user.name,
                "flight_id": booking.flight_id,
                "seat_class": booking.seat_class,
                "booking_price": booking.booking_price,
                "booking_status": booking.booking_status,
                "created_at": booking.created_at.isoformat() if booking.created_at else None,
                "from": source_airport.city,
                "fromCode": source_airport.code,
                "to": dest_airport.city,
                "toCode": dest_airport.code,
                "departureDate": flight.departure_time.strftime("%Y-%m-%d") if flight.departure_time else None,
                "departureTime": flight.departure_time.strftime("%H:%M:%S") if flight.departure_time else None,
                "arrivalDate": flight.arrival_time.strftime("%Y-%m-%d") if flight.arrival_time else None,
                "arrivalTime": flight.arrival_time.strftime("%H:%M:%S") if flight.arrival_time else None,
            })
        return jsonify(output), 200
    except Exception as e:
        logging.exception(f"Error fetching bookings for user {identifier}:")
        return jsonify({"error": "Failed to fetch user bookings", "details": str(e)}), 500
