# models/airport.py
from extensions import db
from sqlalchemy.schema import Sequence

class Airport(db.Model):
    __tablename__ = "airports"
    
    id = db.Column(db.Integer, Sequence("airport_id_seq", start=1, increment=1), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    code = db.Column(db.String(10), unique=True, nullable=False)
    city = db.Column(db.String(50), nullable=False)
    country = db.Column(db.String(50), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "code": self.code,
            "city": self.city,
            "country": self.country
        }
