# backend/models/flight.py

from extensions import db
from sqlalchemy import Sequence

class Flight(db.Model):
    __tablename__ = 'flights'

    id = db.Column(
        db.Integer,
        Sequence('flights_id_seq', start=1, increment=1),
        primary_key=True
    )
    flight_number = db.Column(db.String(255), nullable=False, unique=True)
    airplane_id = db.Column(db.Integer, db.ForeignKey('airplanes.id'), nullable=False)
    departure_airport_id = db.Column(db.Integer, db.ForeignKey('airports.id'), nullable=False)
    arrival_airport_id = db.Column(db.Integer, db.ForeignKey('airports.id'), nullable=False)
    departure_time = db.Column(db.Date, nullable=False)
    arrival_time = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(11), nullable=True)
    price = db.Column(db.Numeric(10, 2), nullable=False)

    # Define relationships if needed
    airplane = db.relationship("Airplane", backref="flights")
    departure_airport = db.relationship("Airport", foreign_keys=[departure_airport_id])
    arrival_airport = db.relationship("Airport", foreign_keys=[arrival_airport_id])

    def serialize(self):
        return {
            "id": self.id,
            "flight_number": self.flight_number,
            "airplane_id": self.airplane_id,
            "departure_airport_id": self.departure_airport_id,
            "arrival_airport_id": self.arrival_airport_id,
            "departure_time": self.departure_time,
            "arrival_time": self.arrival_time,
            "status": self.status,
            "price": str(self.price),  # Convert price to string for proper JSON serialization
        }

    def __repr__(self):
        return f"<Flight {self.flight_number}>"
