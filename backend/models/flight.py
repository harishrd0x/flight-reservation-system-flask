# backend/models/flight.py

from backend.extensions import db
from sqlalchemy import Sequence, Enum as PgEnum
from backend.models.enums import FlightStatus

class Flight(db.Model):
    __tablename__ = 'flights'

    id = db.Column(
        db.Integer,
        Sequence('flights_id_seq', start=1, increment=1),
        primary_key=True
    )
    flight_name = db.Column(db.String(100), nullable=False)
    airplane_id = db.Column(db.Integer, db.ForeignKey('airplanes.id'), nullable=False)
    source_airport_id = db.Column(db.Integer, db.ForeignKey('airports.id'), nullable=False)
    destination_airport_id = db.Column(db.Integer, db.ForeignKey('airports.id'), nullable=False)
    departure_time = db.Column(db.DateTime, nullable=False)
    arrival_time = db.Column(db.DateTime, nullable=False)
    status = db.Column(PgEnum(FlightStatus, name="flight_status"), nullable=False)

    def serialize(self):
        return {
            "id": self.id,
            "flight_name": self.flight_name,
            "airplane_id": self.airplane_id,
            "source_airport_id": self.source_airport_id,
            "destination_airport_id": self.destination_airport_id,
            "departure_time": self.departure_time.isoformat(),
            "arrival_time": self.arrival_time.isoformat(),
            "status": self.status.value
        }

    def __repr__(self):
        return f"<Flight {self.flight_name} ({self.status.value})>"