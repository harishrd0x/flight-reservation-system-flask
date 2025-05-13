# backend/services/airport_service.py

import logging
from backend.extensions import db
from backend.models.airport import Airport
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from backend.exceptions.custom_exceptions import BadRequestError

logger = logging.getLogger(__name__)

def create_airport(data):
    try:
        name = data.get('name')
        city = data.get('city')
        country = data.get('country')
        airport_code = data.get('airport_code')

        # Check if airport code is unique
        existing_airport = Airport.query.filter_by(airport_code=airport_code).first()
        if existing_airport:
            raise BadRequestError(f"Airport with code {airport_code} already exists.")

        # Create new airport
        airport = Airport(name=name, city=city, country=country, airport_code=airport_code)
        db.session.add(airport)
        db.session.commit()

        return airport
    except IntegrityError as e:
        db.session.rollback()
        logger.exception("Integrity error occurred while creating airport.")
        raise BadRequestError("Integrity error occurred while creating airport.")
    except SQLAlchemyError as e:
        logger.exception("Database error occurred while creating airport.")
        raise RuntimeError("Database error occurred while creating airport.")
    except Exception as e:
        logger.exception("Unexpected error occurred while creating airport.")
        raise e


def get_airport_by_id(airport_id):
    return Airport.query.get(airport_id)


def get_airport_by_code(code):
    return Airport.query.filter_by(airport_code=code).first()


def update_airport(airport_id, data):
    airport = get_airport_by_id(airport_id)
    if not airport:
        raise BadRequestError("Airport not found.")

    airport.name = data.get("name", airport.name)
    airport.city = data.get("city", airport.city)
    airport.country = data.get("country", airport.country)
    code = data.get("airport_code", airport.airport_code)

    if code != airport.airport_code:
        # Check uniqueness of new code
        if Airport.query.filter_by(airport_code=code).first():
            raise BadRequestError(f"Airport code {code} is already taken.")
        airport.airport_code = code

    try:
        db.session.commit()
        return airport
    except SQLAlchemyError:
        db.session.rollback()
        logger.exception("Error updating airport.")
        raise RuntimeError("Failed to update airport.")


def delete_airport(airport_id):
    airport = get_airport_by_id(airport_id)
    if not airport:
        raise BadRequestError("Airport not found.")

    try:
        db.session.delete(airport)
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        logger.exception("Error deleting airport.")
        raise RuntimeError("Failed to delete airport.")
