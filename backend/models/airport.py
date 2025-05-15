# backend/models/airport.py

from extensions import db
from sqlalchemy import Sequence

class Airport(db.Model):
    __tablename__ = 'airports'

    id = db.Column(
        db.Integer,
        Sequence('airports_id_seq', start=1, increment=1),
        primary_key=True
    )
    name = db.Column(db.String(150), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    country = db.Column(db.String(100), nullable=False)
    airport_code = db.Column(db.String(3), unique=True, nullable=False)

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "city": self.city,
            "country": self.country,
            "airport_code": self.airport_code
        }

    def __repr__(self):
        return f"<Airport {self.airport_code}>"
