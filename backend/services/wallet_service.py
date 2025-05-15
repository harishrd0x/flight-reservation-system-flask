import logging
from decimal import Decimal

from models.wallet import Wallet
from models.user import User
from models.payment_transaction import PaymentTransaction
from extensions import db
from exceptions.wallet_exceptions import WalletError
from flask import jsonify

logger = logging.getLogger(__name__)

class WalletService:
    @staticmethod
    def get_wallet(user_id):
        wallet = Wallet.query.filter_by(user_id=user_id).first()
        if not wallet:
            raise WalletError("Wallet not found", 404)

        user = User.query.get(user_id)
        wallet_data = wallet.to_dict()
        wallet_data["userName"] = user.name if user else "Unknown User"
        wallet_data["email"] = user.email if user else "No email provided"

        return jsonify(wallet_data), 200

    @staticmethod
    def add_funds(user_id, data):
        if not data:
            raise WalletError("No JSON data provided", 400)

        amount = data.get("amount")
        if amount is None:
            raise WalletError("Amount is required", 400)

        wallet = Wallet.query.filter_by(user_id=user_id).first()
        if wallet is None:
            wallet = Wallet(user_id=user_id, balance=Decimal("0.00"))
            db.session.add(wallet)
            db.session.flush()

        try:
            deposit = Decimal(amount)
            if deposit <= 0:
                raise WalletError("Amount must be positive", 400)
            wallet.balance += deposit
        except Exception as e:
            raise WalletError(f"Invalid amount format: {str(e)}", 400)

        transaction = PaymentTransaction(
            wallet_id=wallet.id,
            amount=deposit,
            transaction_type="CREDIT",
            description="Added funds to wallet"
        )
        db.session.add(transaction)

        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            logger.error("Database commit failed", exc_info=True)
            raise WalletError("Failed to add funds", 500)

        return jsonify({"message": "Funds added", "wallet": wallet.to_dict()}), 200
