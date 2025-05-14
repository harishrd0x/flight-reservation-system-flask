from sqlalchemy import Column, Integer, Numeric, Sequence
from sqlalchemy.orm import relationship
from extensions import db

class Wallet(db.Model):
    __tablename__ = "wallets"
    
    id = Column(Integer, Sequence('wallet_seq', start=1, increment=1), primary_key=True)
    user_id = Column(Integer, nullable=False)
    balance = Column(Numeric, nullable=False)
    
    payment_transactions = relationship(
        "PaymentTransaction",
        back_populates="wallet",
        cascade="all, delete-orphan"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "balance": float(self.balance),
            "payment_transactions": [tx.to_dict() for tx in self.payment_transactions] if self.payment_transactions else []
        }
