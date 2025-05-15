from models.airplane import Airplane
from extensions import db
from exceptions.custom_exceptions import NotFoundError, BadRequestError

def get_all_airplanes():
    airplanes = Airplane.query.all()
    return [airplane.to_dict() for airplane in airplanes]

def create_airplane(data):
    required_fields = ["model", "airline", "capacity", "manufacture"]
    if not all(field in data for field in required_fields):
        raise BadRequestError("Missing required fields")

    airplane = Airplane(
        model=data["model"],
        airline=data["airline"],
        capacity=data["capacity"],
        manufacture=data["manufacture"]
    )
    db.session.add(airplane)
    db.session.commit()
    return airplane

def delete_airplane_by_id(airplane_id):
    airplane = Airplane.query.get(airplane_id)
    if not airplane:
        raise NotFoundError("Airplane not found")

    db.session.delete(airplane)
    db.session.commit()
    return "Airplane deleted successfully"
