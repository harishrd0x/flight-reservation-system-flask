import logging
from decimal import Decimal
from flask import Blueprint, request, jsonify
from models.booking import Booking
from models.user import User
from models.flight import Flight, FlightClass
from models.airport import Airport  # Import the Airport model
from models.payment_transaction import PaymentTransaction
from models.wallet import Wallet
from extensions import db
from datetime import datetime
from sqlalchemy.orm import aliased
from flask_jwt_extended import jwt_required, get_jwt_identity

booking_bp = Blueprint("booking", __name__)

# -----------------------------------------------------------------------------
# Create a Booking endpoint.
@booking_bp.route("/book_flight", methods=["POST"])
@jwt_required()
def book_flight():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON data provided"}), 400

    # Extract user_id from JWT token and convert it to an integer.
    user_id_raw = get_jwt_identity()
    try:
        user_id = int(user_id_raw)
    except ValueError:
        return jsonify({"error": "Invalid user identity in token"}), 400

    flight_id = data.get("flight_id")
    seat_class_str = data.get("seat_class")
    # Since user_id is obtained dynamically from the token, we only check for flight_id and seat_class.
    if not flight_id or not seat_class_str:
        return jsonify({"error": "Missing required fields"}), 400

    try:
        selected_class = FlightClass(seat_class_str.upper())
    except ValueError:
        return jsonify({
            "error": "Invalid flight class provided. Allowed values: ECONOMY, BUSINESS."
        }), 400

    flight = Flight.query.get(flight_id)
    if not flight:
        return jsonify({"error": "Flight not found"}), 404

    price = flight.get_price_by_class(selected_class)
    if price == 0:
        return jsonify({"error": "Price not found for selected class"}), 400

    booking = Booking(
        user_id=user_id,
        flight_id=flight_id,
        seat_class=selected_class.value,
        booking_price=price,
        booking_status="PENDING"
    )

    try:
        db.session.add(booking)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        logging.exception("Booking creation failed:")
        return jsonify({"error": "Booking creation failed", "details": str(e)}), 500

    return jsonify({"message": "Booking created", "booking": booking.to_dict()}), 201


    booking = Booking(
        user_id=user_id,
        flight_id=flight_id,
        seat_class=selected_class.value,
        booking_price=price,
        booking_status="PENDING"
    )

    try:
        db.session.add(booking)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        logging.exception("Booking creation failed:")
        return jsonify({"error": "Booking creation failed", "details": str(e)}), 500

    return jsonify({"message": "Booking created", "booking": booking.to_dict()}), 201

# -----------------------------------------------------------------------------
# Confirm Booking and Debit Wallet endpoint.
@booking_bp.route("/confirm/<int:booking_id>", methods=["PUT"])
def confirm_booking(booking_id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON data provided"}), 400

    if data.get("payment_status") != "PAID":
        return jsonify({"error": "Payment status not confirmed. Cannot update booking."}), 400

    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({"error": "Booking not found"}), 404

    if booking.booking_status != "PENDING":
        return jsonify({"error": "Only pending bookings can be confirmed."}), 400

    try:
        wallet = Wallet.query.filter_by(user_id=booking.user_id).first()
        if not wallet:
            return jsonify({"error": "Wallet not found for user"}), 404

        booking_price = Decimal(str(booking.booking_price))
        logging.info("Confirm Booking: Wallet initial balance: %s, Booking Price: %s", wallet.balance, booking_price)
        
        if wallet.balance < booking_price:
            return jsonify({"error": "Insufficient funds in wallet"}), 400

        wallet.balance -= booking_price
        logging.info("Confirm Booking: Wallet balance after deduction: %s", wallet.balance)

        booking.booking_status = "CONFIRMED"

        payment_tx = PaymentTransaction(
            wallet_id=wallet.id,
            booking_id=booking.id,
            amount=booking_price,
            transaction_type="PAYMENT",
            description="Payment confirmed for booking"
        )
        db.session.add(payment_tx)
        db.session.commit()

        db.session.refresh(wallet)
        logging.info("Confirm Booking: Wallet balance after commit and refresh: %s", wallet.balance)

        return jsonify({
            "message": "Booking confirmed and wallet debited",
            "booking": booking.to_dict(),
            "wallet": wallet.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        logging.exception("Failed to confirm booking:")
        return jsonify({"error": "Failed to confirm booking", "details": str(e)}), 500

# -----------------------------------------------------------------------------
# Cancel Booking and Refund Wallet endpoint.
@booking_bp.route("/cancel/<int:booking_id>", methods=["PUT"])
def cancel_booking(booking_id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON data provided"}), 400

    new_status = data.get("status", "").upper()
    if new_status != "CANCELLED":
        return jsonify({"error": "Invalid status update. Allowed value: 'CANCELLED'"}), 400

    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({"error": "Booking not found"}), 404

    try:
        if booking.booking_status == "CONFIRMED":
            wallet = Wallet.query.filter_by(user_id=booking.user_id).first()
            if not wallet:
                return jsonify({"error": "Wallet not found for user"}), 404

            booking_price = Decimal(str(booking.booking_price))
            logging.info("Cancel Booking: Wallet initial balance: %s, Booking Price: %s", wallet.balance, booking_price)

            wallet.balance += booking_price
            logging.info("Cancel Booking: Wallet balance after refund addition: %s", wallet.balance)

            refund_tx = PaymentTransaction(
                wallet_id=wallet.id,
                booking_id=booking.id,
                amount=booking_price,
                transaction_type="REFUND",
                description="Refund issued for cancelled booking"
            )
            db.session.add(refund_tx)

        booking.booking_status = "CANCELLED"
        db.session.commit()

        wallet = Wallet.query.filter_by(user_id=booking.user_id).first()
        if wallet:
            db.session.refresh(wallet)
            logging.info("Cancel Booking: Wallet balance after commit and refresh: %s", wallet.balance)

        return jsonify({
            "message": "Booking cancelled and refund processed (if applicable)",
            "booking": booking.to_dict(),
            "wallet": wallet.to_dict() if wallet else None
        }), 200
    except Exception as e:
        db.session.rollback()
        logging.exception("Failed to cancel booking:")
        return jsonify({"error": "Failed to cancel booking", "details": str(e)}), 500

# -----------------------------------------------------------------------------
# Get All Bookings endpoint.
@booking_bp.route("/", methods=["GET"])
def get_all_bookings():
    try:
        # Create aliases for the airport joins.
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

# -----------------------------------------------------------------------------
# Get Bookings for a Specific User endpoint.
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
        logging.exception("Error fetching bookings for user %s:", identifier)
        return jsonify({"error": "Failed to fetch user bookings", "details": str(e)}), 500
