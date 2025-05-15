from datetime import datetime
from typing import Tuple
from extensions import db
from models.flight import Flight, FlightStatus, FlightPrice, FlightClass
from exceptions.custom_exceptions import BadRequestError, NotFoundError

def create_flight(data: dict) -> Flight:
    try:
        departure_time = datetime.fromisoformat(data["departure_time"])
        arrival_time = datetime.fromisoformat(data["arrival_time"])
    except (KeyError, ValueError):
        raise BadRequestError("Invalid or missing datetime format. Use ISO8601 format for departure_time and arrival_time.")

    try:
        status_enum = FlightStatus(data.get("status", "ACTIVE"))
    except ValueError:
        raise BadRequestError("Invalid status. Allowed values: ACTIVE, IN_PROGRESS, COMPLETED, CANCELLED.")

    flight = Flight(
        flight_name=data.get("flight_name"),
        airplane_id=data.get("airplane_id"),
        source_airport_id=data.get("source_airport_id"),
        destination_airport_id=data.get("destination_airport_id"),
        departure_time=departure_time,
        arrival_time=arrival_time,
        flight_status=status_enum
    )
    db.session.add(flight)
    db.session.commit()
    return flight

def get_all_flights() -> list[dict]:
    flights = Flight.query.all()
    return [flight.to_dict() for flight in flights]

def create_or_update_flight_price(data: dict) -> Tuple[FlightPrice, str]:
    flight_id = data.get("flight_id")
    flight_class_value = data.get("flight_class")
    price = data.get("price")

    if not all([flight_id, flight_class_value, price]):
        raise BadRequestError("Missing required fields: flight_id, flight_class, price.")

    try:
        flight_class_enum = FlightClass(flight_class_value)
    except ValueError:
        raise BadRequestError("Invalid flight class. Allowed: ECONOMY, BUSINESS.")

    try:
        price = float(price)
        if price <= 0:
            raise ValueError()
    except (ValueError, TypeError):
        raise BadRequestError("Price must be a positive number.")

    flight = Flight.query.get(flight_id)
    if not flight:
        raise NotFoundError("Flight not found.")

    flight_price = FlightPrice.query.filter_by(
        flight_id=flight_id,
        flight_class=flight_class_enum
    ).first()

    if flight_price:
        flight_price.price = price
        db.session.commit()
        return flight_price, "updated"
    else:
        flight_price = FlightPrice(
            flight_id=flight_id,
            flight_class=flight_class_enum,
            price=price
        )
        db.session.add(flight_price)
        db.session.commit()
        return flight_price, "created"
