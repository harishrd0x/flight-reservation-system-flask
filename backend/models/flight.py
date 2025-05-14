import enum
from datetime import datetime
from extensions import db
from sqlalchemy.schema import Sequence

# Define an Enum for flight statuses
class FlightStatus(enum.Enum):
    ACTIVE = "ACTIVE"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

# Define an Enum for flight classes
class FlightClass(enum.Enum):
    ECONOMY = "ECONOMY"
    BUSINESS = "BUSINESS"

class Flight(db.Model):
    __tablename__ = "flights"
    
    id = db.Column(db.Integer, Sequence("flight_id_seq", start=1, increment=1), primary_key=True)
    flight_name = db.Column(db.String(100), nullable=False)
    airplane_id = db.Column(db.Integer, nullable=False)
    source_airport_id = db.Column(db.Integer, nullable=False)
    destination_airport_id = db.Column(db.Integer, nullable=False)
    departure_time = db.Column(db.DateTime, nullable=False)
    arrival_time = db.Column(db.DateTime, nullable=False)
    flight_status = db.Column(db.Enum(FlightStatus), nullable=False)
    
    # Relationship to flight prices
    prices = db.relationship("FlightPrice", backref="flight", cascade="all, delete-orphan", lazy=True)
    
    def get_price_by_class(self, selected_class: FlightClass) -> float:
        """
        Returns the price for the flight corresponding to the given flight class.
        If the price is not found, returns 0.0.
        """
        for price_obj in self.prices:
            # Compare the enum values; ensure both sides are enums
            if price_obj.flight_class == selected_class:
                return float(price_obj.price)
        return 0.0

    def to_dict(self):
        return {
            "id": self.id,
            "flight_name": self.flight_name,
            "airplane_id": self.airplane_id,
            "source_airport_id": self.source_airport_id,
            "destination_airport_id": self.destination_airport_id,
            "departure_time": self.departure_time.isoformat(),
            "arrival_time": self.arrival_time.isoformat(),
            "flight_status": self.flight_status.value,
            "prices": [price.to_dict() for price in self.prices]
        }

class FlightPrice(db.Model):
    __tablename__ = "flight_prices"
    
    id = db.Column(db.Integer, Sequence("flight_price_id_seq", start=1, increment=1), primary_key=True)
    flight_id = db.Column(db.Integer, db.ForeignKey("flights.id"), nullable=False)
    flight_class = db.Column(db.Enum(FlightClass), nullable=False)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    
    __table_args__ = (
        db.UniqueConstraint("flight_id", "flight_class", name="u_flight_price"),
    )
    
    def to_dict(self):
        return {
            "id": self.id,
            "flight_id": self.flight_id,
            "flight_class": self.flight_class.value,
            "price": float(self.price)
        }
