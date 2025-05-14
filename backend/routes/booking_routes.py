import logging
from decimal import Decimal
from flask import Blueprint, request, jsonify
from models.booking import Booking
from models.user import User
from models.flight import Flight, FlightClass
from models.payment_transaction import PaymentTransaction
from models.wallet import Wallet
from extensions import db

booking_bp = Blueprint("booking", __name__)

# -----------------------------------------------------------------------------
# Endpoint: Create a Booking (POST /bookings/book_flight)
@booking_bp.route("/book_flight", methods=["POST"])
def book_flight():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON data provided"}), 400

    user_id = data.get("user_id")
    flight_id = data.get("flight_id")
    seat_class_str = data.get("seat_class")
    if not user_id or not flight_id or not seat_class_str:
        return jsonify({"error": "Missing required fields"}), 400

    try:
        selected_class = FlightClass(seat_class_str.upper())
    except ValueError:
        return jsonify({"error": "Invalid flight class provided. Allowed values: ECONOMY, BUSINESS."}), 400

    flight = Flight.query.get(flight_id)
    if not flight:
        return jsonify({"error": "Flight not found"}), 404

    price = flight.get_price_by_class(selected_class)
    if price == 0:
        return jsonify({"error": "Price not found for selected class"}), 400

    # Create a booking with an initial status of "PENDING"
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
# Endpoint: Confirm Booking and Debit Wallet (PUT /bookings/confirm/<booking_id>)
@booking_bp.route("/confirm/<int:booking_id>", methods=["PUT"])
def confirm_booking(booking_id):
    """
    Confirms a booking and deducts the booking amount from the user's wallet.
    Expected JSON payload: { "payment_status": "PAID" }
    """
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
        # Retrieve the user's wallet
        wallet = Wallet.query.filter_by(user_id=booking.user_id).first()
        if not wallet:
            return jsonify({"error": "Wallet not found for user"}), 404

        # Convert booking price to Decimal for consistency.
        booking_price = Decimal(str(booking.booking_price))
        logging.info("Confirm Booking: Wallet initial balance: %s, Booking Price: %s", wallet.balance, booking_price)

        # Check if wallet has sufficient funds.
        if wallet.balance < booking_price:
            return jsonify({"error": "Insufficient funds in wallet"}), 400

        # Deduct the booking amount from the wallet.
        wallet.balance -= booking_price
        logging.info("Confirm Booking: Wallet balance after deduction: %s", wallet.balance)

        # Update booking status to CONFIRMED.
        booking.booking_status = "CONFIRMED"

        # Log a PAYMENT transaction.
        payment_tx = PaymentTransaction(
            wallet_id=wallet.id,
            booking_id=booking.id,
            amount=booking_price,
            transaction_type="PAYMENT",
            description="Payment confirmed for booking"
        )
        db.session.add(payment_tx)
        db.session.commit()

        # Refresh the wallet instance to ensure we fetch the updated balance.
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
# Endpoint: Cancel Booking and Refund Wallet (PUT /bookings/cancel/<booking_id>)
@booking_bp.route("/cancel/<int:booking_id>", methods=["PUT"])
def cancel_booking(booking_id):
    """
    Cancels a booking and refunds the booking amount to the user's wallet (if applicable).
    Expected JSON payload: { "status": "CANCELLED" }
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON data provided"}), 400

    # Enforce that the payload specifies status as "CANCELLED".
    new_status = data.get("status", "").upper()
    if new_status != "CANCELLED":
        return jsonify({"error": "Invalid status update. Allowed value: 'CANCELLED'"}), 400

    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({"error": "Booking not found"}), 404

    try:
        # Process a refund only if the booking was previously confirmed.
        if booking.booking_status == "CONFIRMED":
            wallet = Wallet.query.filter_by(user_id=booking.user_id).first()
            if not wallet:
                return jsonify({"error": "Wallet not found for user"}), 404

            # Convert booking price to Decimal for consistent arithmetic.
            booking_price = Decimal(str(booking.booking_price))
            logging.info("Cancel Booking: Wallet initial balance: %s, Booking Price: %s", wallet.balance, booking_price)

            # Refund the booking amount by adding it back to the wallet balance.
            wallet.balance += booking_price
            logging.info("Cancel Booking: Wallet balance after refund addition: %s", wallet.balance)

            # Log a REFUND transaction.
            refund_tx = PaymentTransaction(
                wallet_id=wallet.id,
                booking_id=booking.id,
                amount=booking_price,
                transaction_type="REFUND",
                description="Refund issued for cancelled booking"
            )
            db.session.add(refund_tx)

        # Update booking status to CANCELLED (even if it wasn't previously confirmed).
        booking.booking_status = "CANCELLED"
        db.session.commit()

        # Refresh the wallet instance after commit (if wallet exists).
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
# Endpoint: Get All Bookings (GET /bookings/)
@booking_bp.route("/", methods=["GET"])
def get_all_bookings():
    try:
        records = db.session.query(Booking, User).filter(Booking.user_id == User.id).all()
        output = []
        for booking, user in records:
            output.append({
                "id": booking.id,
                "user_id": booking.user_id,
                "user_name": user.name,
                "flight_id": booking.flight_id,
                "seat_class": booking.seat_class,
                "booking_price": booking.booking_price,
                "booking_status": booking.booking_status,
                "created_at": booking.created_at.isoformat() if booking.created_at else None
            })
        return jsonify(output), 200
    except Exception as e:
        logging.exception("Error fetching all bookings:")
        return jsonify({"error": "Failed to fetch bookings", "details": str(e)}), 500


# -----------------------------------------------------------------------------
# Endpoint: Get Bookings for a Specific User (GET /bookings/user/<user_id>)
@booking_bp.route("/user/<int:user_id>", methods=["GET"])
def get_user_bookings(user_id):
    try:
        records = db.session.query(Booking, User) \
            .filter(Booking.user_id == User.id, User.id == user_id) \
            .order_by(Booking.created_at.desc()).all()
        output = []
        for booking, user in records:
            output.append({
                "id": booking.id,
                "user_id": booking.user_id,
                "user_name": user.name,
                "flight_id": booking.flight_id,
                "seat_class": booking.seat_class,
                "booking_price": booking.booking_price,
                "booking_status": booking.booking_status,
                "created_at": booking.created_at.isoformat() if booking.created_at else None
            })
        return jsonify(output), 200
    except Exception as e:
        logging.exception("Error fetching bookings for user %s:", user_id)
        return jsonify({"error": "Failed to fetch user bookings", "details": str(e)}), 500
