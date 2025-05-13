# backend/services/flight_service.py

import logging
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from backend.extensions import db
from backend.models.flight import Flight
from backend.models.enums import FlightStatus
from backend.models.airplane import Airplane
from backend.models.airport import Airport
from backend.exceptions.custom_exceptions import BadRequestError, NotFoundError
from datetime import datetime, UTC

logger = logging.getLogger(__name__)

from datetime import datetime

def create_flight(data):
    try:
        # Extract data
        flight_name = data.get("flight_name")
        airplane_id = data.get("airplane_id")
        source_airport_id = data.get("source_airport_id")
        destination_airport_id = data.get("destination_airport_id")
        departure_time = data.get("departure_time")
        arrival_time = data.get("arrival_time")
        status = data.get("status")

        if status not in [s.value for s in FlightStatus]:
            raise BadRequestError(f"Invalid status: {status}")

        # Ensure all foreign key IDs are integers
        try:
            airplane_id = int(airplane_id)
            source_airport_id = int(source_airport_id)
            destination_airport_id = int(destination_airport_id)
        except (TypeError, ValueError):
            raise BadRequestError("airplane_id, source_airport_id, and destination_airport_id must be valid integers.")

        # Validate foreign key references
        missing = []
        airplane = Airplane.query.get(airplane_id)
        if not airplane:
            missing.append(f"Airplane with ID {airplane_id} not found.")
        
        source_airport = Airport.query.get(source_airport_id)
        if not source_airport:
            missing.append(f"Source Airport with ID {source_airport_id} not found.")

        destination_airport = Airport.query.get(destination_airport_id)
        if not destination_airport:
            missing.append(f"Destination Airport with ID {destination_airport_id} not found.")

        if missing:
            raise BadRequestError(" | ".join(missing))

        # Validate datetime logic
        now = datetime.now(UTC)

        if departure_time < now:
            raise BadRequestError("Departure time cannot be in the past.")

        if arrival_time <= departure_time:
            raise BadRequestError("Arrival time must be after departure time.")


        # Create and save the flight
        flight = Flight(
            flight_name=flight_name,
            airplane_id=airplane_id,
            source_airport_id=source_airport_id,
            destination_airport_id=destination_airport_id,
            departure_time=departure_time,
            arrival_time=arrival_time,
            status=FlightStatus(status)
        )
        db.session.add(flight)
        db.session.commit()
        return flight

    except IntegrityError:
        db.session.rollback()
        logger.exception("Integrity error occurred while creating flight.")
        raise BadRequestError("Integrity error occurred while creating flight.")
    except SQLAlchemyError:
        db.session.rollback()
        logger.exception("Database error occurred while creating flight.")
        raise RuntimeError("Database error occurred while creating flight.")
    except Exception as e:
        db.session.rollback()
        logger.exception("Unexpected error occurred while creating flight.")
        raise e

def get_all_flights():
    try:
        return Flight.query.all()
    except SQLAlchemyError as e:
        logger.exception("Error retrieving flights from database.")
        raise RuntimeError("Error retrieving flights from database.")

def get_flight_by_id(flight_id):
    try:
        flight = Flight.query.get(flight_id)
        if not flight:
            raise NotFoundError(f"Flight with ID {flight_id} not found.")
        return flight
    except SQLAlchemyError as e:
        logger.exception("Database error while fetching flight by ID.")
        raise RuntimeError("Database error while fetching flight.")

def update_flight(flight_id, data):
    try:
        flight = Flight.query.get(flight_id)
        if not flight:
            raise NotFoundError(f"Flight with ID {flight_id} not found.")

        # Update fields if present
        if "flight_name" in data:
            flight.flight_name = data["flight_name"]
        if "airplane_id" in data:
            flight.airplane_id = data["airplane_id"]
        if "source_airport_id" in data:
            flight.source_airport_id = data["source_airport_id"]
        if "destination_airport_id" in data:
            flight.destination_airport_id = data["destination_airport_id"]
        if "departure_time" in data:
            flight.departure_time = data["departure_time"]
        if "arrival_time" in data:
            flight.arrival_time = data["arrival_time"]
        if "status" in data:
            status = data["status"]
            if status not in [s.value for s in FlightStatus]:
                raise BadRequestError(f"Invalid status: {status}")
            flight.status = FlightStatus(status)

        db.session.commit()
        return flight

    except IntegrityError:
        db.session.rollback()
        logger.exception("Integrity error occurred while updating flight.")
        raise BadRequestError("Integrity error occurred while updating flight.")
    except SQLAlchemyError:
        db.session.rollback()
        logger.exception("Database error occurred while updating flight.")
        raise RuntimeError("Database error occurred while updating flight.")
    except Exception as e:
        db.session.rollback()
        logger.exception("Unexpected error occurred while updating flight.")
        raise e

def delete_flight(flight_id):
    try:
        flight = Flight.query.get(flight_id)
        if not flight:
            raise NotFoundError(f"Flight with ID {flight_id} not found.")

        db.session.delete(flight)
        db.session.commit()
        return True

    except SQLAlchemyError:
        db.session.rollback()
        logger.exception("Database error occurred while deleting flight.")
        raise RuntimeError("Database error occurred while deleting flight.")
    except Exception as e:
        db.session.rollback()
        logger.exception("Unexpected error occurred while deleting flight.")
        raise e
