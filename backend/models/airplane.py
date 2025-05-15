# backend/models/airplane.py

from extensions import db
from sqlalchemy import Sequence

class Airplane(db.Model):
    __tablename__ = 'airplanes'

    id = db.Column(
        db.Integer,
        Sequence('airplanes_id_seq', start=1, increment=1),
        primary_key=True
    )
    airplane_number = db.Column(db.String(6), unique=True, nullable=False)
    model = db.Column(db.String(100), nullable=False)
    total_seats = db.Column(db.Integer, nullable=False)
    economy_seats = db.Column(db.Integer, nullable=False)
    business_seats = db.Column(db.Integer, nullable=False)
    first_class_seats = db.Column(db.Integer, nullable=False)

    def serialize(self):
        return {
            "id": self.id,
            "airplane_number": self.airplane_number,
            "model": self.model,
            "total_seats": self.total_seats,
            "economy_seats": self.economy_seats,
            "business_seats": self.business_seats,
            "first_class_seats": self.first_class_seats
        }


    def __repr__(self):
        return f"<Airplane {self.airplane_number}>"
