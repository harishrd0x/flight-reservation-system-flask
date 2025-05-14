from extensions import db

class Passenger(db.Model):
    __tablename__ = "passengers"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    booking_id = db.Column(db.Integer, nullable=False)  # You might want to set up a foreign key to bookings
    name = db.Column(db.String(100), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    passport_number = db.Column(db.String(50), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "booking_id": self.booking_id,
            "name": self.name,
            "age": self.age,
            "passport_number": self.passport_number
        }
