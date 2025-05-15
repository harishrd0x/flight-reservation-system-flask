from models.airport import Airport
from extensions import db
from exceptions.custom_exceptions import BadRequestError, NotFoundError

def get_all_airports():
    airports = Airport.query.all()
    return [airport.to_dict() for airport in airports]

def create_airport(data):
    if Airport.query.filter_by(code=data.get("code")).first():
        raise BadRequestError("Airport code already exists")

    airport = Airport(
        name=data["name"],
        code=data["code"],
        city=data["city"],
        country=data["country"]
    )
    db.session.add(airport)
    db.session.commit()
    return airport

def delete_airport_by_id(airport_id):
    airport = Airport.query.get(airport_id)
    if not airport:
        raise NotFoundError("Airport not found")

    db.session.delete(airport)
    db.session.commit()
    return "Airport deleted successfully"
