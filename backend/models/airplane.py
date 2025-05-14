from extensions import db
from sqlalchemy.schema import Sequence

class Airplane(db.Model):
    __tablename__ = "airplanes"

    id = db.Column(db.Integer, Sequence("airplane_id_seq", start=1, increment=1), primary_key=True)
    model = db.Column(db.String(100), nullable=False)
    airline = db.Column(db.String(100), nullable=False)
    capacity = db.Column(db.Integer, nullable=False)
    manufacture = db.Column(db.String(100), nullable=False)  # Ensure this is defined

    def to_dict(self):
        return {
            "id": self.id,
            "model": self.model,
            "airline": self.airline,
            "capacity": self.capacity,
            "manufacture": self.manufacture,  # Make sure to include it!
        }
