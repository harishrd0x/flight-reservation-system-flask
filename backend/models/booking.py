from extensions import db

class Booking(db.Model):
    __tablename__ = "BOOKINGS"  # Keeping uppercase for consistency

    id = db.Column("ID", db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column("USER_ID", db.Integer, nullable=False)
    flight_id = db.Column("FLIGHT_ID", db.Integer, nullable=False)
    seat_class = db.Column("SEAT_CLASS", db.String(20), nullable=False)
    booking_price = db.Column("BOOKING_PRICE", db.Float, nullable=False)
    booking_status = db.Column("BOOKING_STATUS", db.String(50), nullable=False, default='PENDING')
    created_at = db.Column("CREATED_AT", db.DateTime, server_default=db.func.current_timestamp())

    # Relationship with PaymentTransaction
    payment_transactions = db.relationship(
        "PaymentTransaction",
        back_populates="booking",
        cascade="all, delete-orphan"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "flight_id": self.flight_id,
            "seat_class": self.seat_class,
            "booking_price": self.booking_price,
            "booking_status": self.booking_status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "payment_transactions": [tx.to_dict() for tx in self.payment_transactions] if self.payment_transactions else []
        }
