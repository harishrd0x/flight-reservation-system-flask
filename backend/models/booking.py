from datetime import datetime
from sqlalchemy import Column, Integer, ForeignKey, DateTime, Enum, Numeric, Sequence
from sqlalchemy.orm import relationship
from extensions import db
from models.enums import BookingStatusEnum

class Booking(db.Model):
    __tablename__ = "bookings"

    id = Column(
        Integer,
        Sequence('bookings_id_seq', start=1, increment=1),
        primary_key=True
    )
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    flight_id = Column(Integer, ForeignKey("flights.id"), nullable=False)
    booking_time = Column(DateTime, default=datetime.utcnow)
    status = Column(Enum(BookingStatusEnum), default=BookingStatusEnum.PENDING)
    total_price = Column(Numeric(10, 2), nullable=False)

    # Relationships
    user = relationship("User", back_populates="bookings")
    flight = relationship("Flight", back_populates="bookings")
    passengers = relationship("Passenger", back_populates="booking", cascade="all, delete-orphan")
