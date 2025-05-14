import logging
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from backend.extensions import db
from backend.models.flight import Flight
from backend.models.airplane import Airplane
from backend.models.airport import Airport
from backend.exceptions.custom_exceptions import BadRequestError, NotFoundError
from datetime import datetime, timezone
from backend.models.enums import FlightStatus


logger = logging.getLogger(__name__)

def create_flight(data):
    try:
        logger.info("Received flight creation request: %s", data)

        flight_number = data["flight_number"]
        airplane_id = int(data["airplane_id"])
        source_airport_id = int(data["departure_airport_id"])
        destination_airport_id = int(data["arrival_airport_id"])
        departure_time = data["departure_time"]
        arrival_time = data["arrival_time"]
        status = data["status"]
        price = data["price"]

        if status not in [s.name for s in FlightStatus]:
            raise BadRequestError(f"Invalid status: {status}")

        logger.debug("Validating related entities...")

        airplane = Airplane.query.get(airplane_id)
        source_airport = Airport.query.get(source_airport_id)
        destination_airport = Airport.query.get(destination_airport_id)

        missing = []
        if not airplane:
            missing.append(f"Airplane with ID {airplane_id} not found.")
        if not source_airport:
            missing.append(f"Source Airport with ID {source_airport_id} not found.")
        if not destination_airport:
            missing.append(f"Destination Airport with ID {destination_airport_id} not found.")
        if missing:
            raise BadRequestError(" | ".join(missing))

        if isinstance(departure_time, str):
            departure_time = datetime.strptime(departure_time, "%Y-%m-%d %H:%M:%S")
        if isinstance(arrival_time, str):
            arrival_time = datetime.strptime(arrival_time, "%Y-%m-%d %H:%M:%S")

        if departure_time.tzinfo is None:
            departure_time = departure_time.replace(tzinfo=timezone.utc)
        if arrival_time.tzinfo is None:
            arrival_time = arrival_time.replace(tzinfo=timezone.utc)

        now = datetime.now(timezone.utc)
        if departure_time < now:
            raise BadRequestError("Departure time cannot be in the past.")
        if arrival_time <= departure_time:
            raise BadRequestError("Arrival time must be after departure time.")

        logger.debug("Creating Flight instance...")

        flight = Flight(
            flight_number=flight_number,
            airplane_id=airplane_id,
            departure_airport_id=source_airport_id,
            arrival_airport_id=destination_airport_id,
            departure_time=departure_time,
            arrival_time=arrival_time,
            status=FlightStatus[status],
            price=price
        )

        db.session.add(flight)
        db.session.commit()

        logger.info("Flight successfully created with ID %s", flight.id)
        return flight

    except BadRequestError as e:
        logger.exception("BadRequestError occurred: %s", e)
        raise BadRequestError(str(e))
    except NotFoundError as e:
        logger.exception("NotFoundError occurred: %s", e)
        raise NotFoundError(str(e))
    except IntegrityError as e:
        logger.exception("IntegrityError during flight creation: %s", e)
        db.session.rollback()
        raise BadRequestError("Integrity violation occurred while creating the flight. Please check the data.")
    except SQLAlchemyError as e:
        logger.exception("SQLAlchemyError during flight creation: %s", e)
        db.session.rollback()
        raise RuntimeError("Database error occurred. Please try again later.")
    except Exception as e:
        logger.exception("Unexpected error during flight creation: %s", e)
        db.session.rollback()
        raise RuntimeError("An unexpected error occurred. Please contact support.")

def get_all_flights():
    try:
        logger.info("Fetching all flights...")

        # Fetch all flights
        flights = Flight.query.all()

        if not flights:
            raise NotFoundError("No flights found.")

        logger.debug("Successfully fetched %d flights.", len(flights))
        return flights

    except NotFoundError as e:
        logger.exception("NotFoundError occurred: %s", e)
        raise NotFoundError(str(e))
    except SQLAlchemyError as e:
        logger.exception("SQLAlchemyError during fetching all flights: %s", e)
        raise RuntimeError("Database error occurred. Please try again later.")
    except Exception as e:
        logger.exception("Unexpected error during fetching all flights: %s", e)
        raise RuntimeError("An unexpected error occurred. Please contact support.")


def get_flight_by_id(flight_id):
    try:
        logger.info("Fetching flight with ID %d...", flight_id)

        # Fetch flight by ID
        flight = Flight.query.get(flight_id)

        if not flight:
            raise NotFoundError(f"Flight with ID {flight_id} not found.")

        logger.debug("Successfully fetched flight with ID %d.", flight.id)
        return flight

    except NotFoundError as e:
        logger.exception("NotFoundError occurred: %s", e)
        raise NotFoundError(str(e))
    except SQLAlchemyError as e:
        logger.exception("SQLAlchemyError during fetching flight by ID: %s", e)
        raise RuntimeError("Database error occurred. Please try again later.")
    except Exception as e:
        logger.exception("Unexpected error during fetching flight by ID: %s", e)
        raise RuntimeError("An unexpected error occurred. Please contact support.")

def update_flight(flight_id, data):
    try:
        logger.info("Updating flight with ID %d...", flight_id)

        # Fetch the existing flight
        flight = Flight.query.get(flight_id)
        
        if not flight:
            raise NotFoundError(f"Flight with ID {flight_id} not found.")

        # Update fields
        flight.flight_number = data.get("flight_number", flight.flight_number)
        flight.departure_airport_id = data.get("departure_airport_id", flight.departure_airport_id)
        flight.arrival_airport_id = data.get("arrival_airport_id", flight.arrival_airport_id)
        flight.departure_time = data.get("departure_time", flight.departure_time)
        flight.arrival_time = data.get("arrival_time", flight.arrival_time)
        flight.status = data.get("status", flight.status)
        flight.price = data.get("price", flight.price)

        # Commit the changes
        db.session.commit()

        logger.info("Successfully updated flight with ID %d.", flight.id)
        return flight

    except NotFoundError as e:
        logger.exception("NotFoundError occurred: %s", e)
        raise NotFoundError(str(e))
    except SQLAlchemyError as e:
        logger.exception("SQLAlchemyError during flight update: %s", e)
        db.session.rollback()
        raise RuntimeError("Database error occurred. Please try again later.")
    except Exception as e:
        logger.exception("Unexpected error during flight update: %s", e)
        db.session.rollback()
        raise RuntimeError("An unexpected error occurred. Please contact support.")

def delete_flight(flight_id):
    try:
        logger.info("Deleting flight with ID %d...", flight_id)

        # Fetch the flight to delete
        flight = Flight.query.get(flight_id)

        if not flight:
            raise NotFoundError(f"Flight with ID {flight_id} not found.")

        db.session.delete(flight)
        db.session.commit()

        logger.info("Successfully deleted flight with ID %d.", flight.id)

    except NotFoundError as e:
        logger.exception("NotFoundError occurred: %s", e)
        raise NotFoundError(str(e))
    except SQLAlchemyError as e:
        logger.exception("SQLAlchemyError during flight deletion: %s", e)
        db.session.rollback()
        raise RuntimeError("Database error occurred. Please try again later.")
    except Exception as e:
        logger.exception("Unexpected error during flight deletion: %s", e)
        db.session.rollback()
        raise RuntimeError("An unexpected error occurred. Please contact support.")




def search_flights(departure_airport_id=None, arrival_airport_id=None, departure_time=None):
    try:
        logger.info(f"Searching flights with filters - Departure Airport: {departure_airport_id}, Arrival Airport: {arrival_airport_id}, Departure Time: {departure_time}")

        # Construct the base query
        query = Flight.query

        # Apply filters only if the parameters are provided
        if departure_airport_id:
            query = query.filter(Flight.departure_airport_id == departure_airport_id)

        if arrival_airport_id:
            query = query.filter(Flight.arrival_airport_id == arrival_airport_id)

        if departure_time:
            query = query.filter(Flight.departure_time >= departure_time)

        # Execute the query
        flights = query.all()

        if not flights:
            raise NotFoundError("No flights found matching the criteria.")

        logger.debug(f"Found {len(flights)} flights.")
        return flights

    except SQLAlchemyError as e:
        logger.exception("SQLAlchemyError during flight search: %s", e)
        raise RuntimeError("Database error occurred. Please try again later.")
    except Exception as e:
        logger.exception("Unexpected error during flight search: %s", e)
        raise RuntimeError("An unexpected error occurred. Please contact support.")
