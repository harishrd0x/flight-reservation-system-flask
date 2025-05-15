import logging
from decimal import Decimal
from models.booking import Booking
from models.flight import Flight, FlightClass
from models.wallet import Wallet
from models.payment_transaction import PaymentTransaction
from extensions import db

class BookingService:

    @staticmethod
    def create_booking(user_id: int, flight_id: int, seat_class_str: str):
        try:
            selected_class = FlightClass(seat_class_str.upper())
        except ValueError:
            raise ValueError("Invalid flight class provided. Allowed values: ECONOMY, BUSINESS.")

        flight = Flight.query.get(flight_id)
        if not flight:
            raise LookupError("Flight not found")

        price = flight.get_price_by_class(selected_class)
        if price == 0:
            raise ValueError("Price not found for selected class")

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
            return booking
        except Exception as e:
            db.session.rollback()
            logging.exception("Booking creation failed:")
            raise e

    @staticmethod
    def confirm_booking(booking_id: int):
        booking = Booking.query.get(booking_id)
        if not booking:
            raise LookupError("Booking not found")

        if booking.booking_status != "PENDING":
            raise ValueError("Only pending bookings can be confirmed.")

        wallet = Wallet.query.filter_by(user_id=booking.user_id).first()
        if not wallet:
            raise LookupError("Wallet not found for user")

        booking_price = Decimal(str(booking.booking_price))
        logging.info("Confirm Booking: Wallet initial balance: %s, Booking Price: %s", wallet.balance, booking_price)

        if wallet.balance < booking_price:
            raise ValueError("Insufficient funds in wallet")

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

        try:
            db.session.commit()
            db.session.refresh(wallet)
            logging.info("Confirm Booking: Wallet balance after commit and refresh: %s", wallet.balance)
            return booking, wallet
        except Exception as e:
            db.session.rollback()
            logging.exception("Failed to confirm booking:")
            raise e

    @staticmethod
    def cancel_booking(booking_id: int, status: str):
        if status.upper() != "CANCELLED":
            raise ValueError("Invalid status update. Allowed value: 'CANCELLED'")

        booking = Booking.query.get(booking_id)
        if not booking:
            raise LookupError("Booking not found")

        try:
            if booking.booking_status == "CONFIRMED":
                wallet = Wallet.query.filter_by(user_id=booking.user_id).first()
                if not wallet:
                    raise LookupError("Wallet not found for user")

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

            return booking, wallet
        except Exception as e:
            db.session.rollback()
            logging.exception("Failed to cancel booking:")
            raise e
