from extensions import db
from sqlalchemy import Sequence

class Review(db.Model):
    __tablename__ = "reviews"

    id = db.Column(db.Integer, Sequence('review_id_seq'), primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    booking_id = db.Column(db.Integer, nullable=False)  # Replacing flight_id
    rating = db.Column(db.Integer, nullable=False)  # e.g., rating out of 5
    comment = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "booking_id": self.booking_id,
            "rating": self.rating,
            "comment": self.comment,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
