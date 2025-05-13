import logging
from backend.extensions import db
from backend.models.airplane import Airplane
from backend.exceptions.custom_exceptions import BadRequestError, NotFoundError
from sqlalchemy.exc import SQLAlchemyError, IntegrityError

logger = logging.getLogger(__name__)

def create_airplane(data):
    airplane_number = data.get("airplane_number")
    model = data.get("model")
    total = data.get("total_seats")
    economy = data.get("economy_seats")
    business = data.get("business_seats")
    first = data.get("first_class_seats")

    if total != economy + business + first:
        raise BadRequestError("Total seats must equal the sum of economy, business, and first class seats.")

    airplane = Airplane(
        airplane_number=airplane_number,
        model=model,
        total_seats=total,
        economy_seats=economy,
        business_seats=business,
        first_class_seats=first
    )

    db.session.add(airplane)
    db.session.commit()
    return airplane


def get_all_airplanes():
    try:
        return Airplane.query.all()
    except SQLAlchemyError as e:
        logger.exception("Failed to fetch airplanes.")
        raise RuntimeError("Database error.")


def get_airplane_by_id(airplane_id):
    airplane = Airplane.query.get(airplane_id)
    if not airplane:
        raise NotFoundError("Airplane not found.")
    return airplane


def update_airplane(airplane_id, data):
    airplane = get_airplane_by_id(airplane_id)

    airplane.airplane_number = data.get("airplane_number", airplane.airplane_number)
    airplane.model = data.get("model", airplane.model)
    airplane.total_seats = data.get("total_seats", airplane.total_seats)
    airplane.economy_seats = data.get("economy_seats", airplane.economy_seats)
    airplane.business_seats = data.get("business_seats", airplane.business_seats)
    airplane.first_class_seats = data.get("first_class_seats", airplane.first_class_seats)

    if airplane.total_seats != (
        airplane.economy_seats + airplane.business_seats + airplane.first_class_seats
    ):
        raise BadRequestError("Total seats must equal the sum of class-specific seats.")

    db.session.commit()
    return airplane


def delete_airplane(airplane_id):
    airplane = get_airplane_by_id(airplane_id)
    db.session.delete(airplane)
    db.session.commit()
