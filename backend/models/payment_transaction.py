from extensions import db
from datetime import datetime
from sqlalchemy import Sequence

class PaymentTransaction(db.Model):
    __tablename__ = "PAYMENT_TRANSACTIONS"

    # Use a sequence for auto-generating IDs in Oracle.
    id = db.Column("ID", db.Integer, Sequence("payment_transaction_seq", start=1, increment=1), primary_key=True)
    # Column to associate a transaction with a wallet.
    wallet_id = db.Column("WALLET_ID", db.Integer, db.ForeignKey("wallets.id"), nullable=True)
    # Optional: Column to associate a transaction with a booking.
    booking_id = db.Column("BOOKING_ID", db.Integer, db.ForeignKey("BOOKINGS.ID"), nullable=True)
    amount = db.Column("AMOUNT", db.Float, nullable=False)
    transaction_type = db.Column("TRANSACTION_TYPE", db.String(20), nullable=False, default="PAYMENT")
    description = db.Column("DESCRIPTION", db.String(255))
    timestamp = db.Column("TIMESTAMP", db.DateTime, server_default=db.func.current_timestamp(), nullable=False)

    # Relationship linking back to the Wallet model.
    wallet = db.relationship("Wallet", back_populates="payment_transactions", foreign_keys=[wallet_id])
    # Optional: Relationship linking back to Booking, if needed.
    booking = db.relationship("Booking", back_populates="payment_transactions", foreign_keys=[booking_id])

    def to_dict(self):
        return {
            "id": self.id,
            "wallet_id": self.wallet_id,
            "booking_id": self.booking_id,
            "amount": self.amount,
            "transaction_type": self.transaction_type,
            "description": self.description,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
        }
