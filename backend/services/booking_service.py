# services/booking_service.py

import logging
from datetime import datetime
from models.booking import Booking
from models.passenger import Passenger
from models.enums import BookingStatusEnum, PassengerStatusEnum
from extensions import db
from sqlalchemy.exc import SQLAlchemyError
from exceptions.custom_exceptions import BadRequestError, NotFoundError
from werkzeug.exceptions import Forbidden

logger = logging.getLogger(__name__)

class BookingService:

    @staticmethod
    def create_booking(data):
        try:
            passengers_data = data.pop("passengers")
            booking = Booking(**data)
            db.session.add(booking)
            db.session.flush()  # To get booking.id

            for passenger_data in passengers_data:
                passenger = Passenger(**passenger_data, booking_id=booking.id)
                db.session.add(passenger)

            db.session.commit()
            return booking
        except SQLAlchemyError as e:
            db.session.rollback()
            logger.exception("Database error while creating booking.")
            raise BadRequestError("Failed to create booking due to a database error.")
        except Exception as e:
            db.session.rollback()
            logger.exception("Unexpected error while creating booking.")
            raise BadRequestError(str(e))

    @staticmethod
    def get_bookings_by_user(user_id):
        try:
            return Booking.query.filter_by(user_id=user_id).all()
        except SQLAlchemyError as e:
            logger.exception("Database error while retrieving bookings.")
            raise BadRequestError("Failed to retrieve bookings.")

    @staticmethod
    def get_booking_by_id(booking_id):
        try:
            booking = Booking.query.get(booking_id)
            if not booking:
                raise NotFoundError("Booking not found.")
            return booking
        except SQLAlchemyError:
            logger.exception("Database error while retrieving booking by ID.")
            raise BadRequestError("Failed to retrieve booking.")

    @staticmethod
    def cancel_booking(booking_id, user_id):
        try:
            booking = Booking.query.get(booking_id)
            if not booking:
                raise NotFoundError("Booking not found.")

            if booking.user_id != user_id:
                raise Forbidden("You are not allowed to cancel this booking.")

            booking.status = BookingStatusEnum.CANCELLED
            for passenger in booking.passengers:
                passenger.status = PassengerStatusEnum.CANCELLED
                passenger.cancellation_time = datetime.utcnow()

            db.session.commit()
        except SQLAlchemyError:
            db.session.rollback()
            logger.exception("Database error while cancelling booking.")
            raise BadRequestError("Failed to cancel booking.")
        except Forbidden as e:
            logger.warning("Unauthorized cancellation attempt.")
            raise e
        

    @staticmethod
    def get_all_bookings():
        return Booking.query.all()
