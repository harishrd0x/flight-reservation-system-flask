from datetime import datetime
from sqlalchemy import Column, Integer, String, ForeignKey, Enum, DateTime, CHAR, Sequence
from sqlalchemy.orm import relationship
from extensions import db
from models.enums import PassengerStatusEnum

class Passenger(db.Model):
    __tablename__ = "passengers"

    id = Column(
        Integer,
        Sequence('passengers_id_seq', start=1, increment=1),
        primary_key=True
    )
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    gender = Column(CHAR(1), nullable=False)
    age = Column(Integer, nullable=False)
    status = Column(Enum(PassengerStatusEnum), default=PassengerStatusEnum.BOOKED)
    cancellation_time = Column(DateTime, default=None, nullable=True)

    # Relationships
    booking = relationship("Booking", back_populates="passengers")
