from flask import Blueprint, request, jsonify
from models.wallet import Wallet
from models.user import User  # Import the User model
from decimal import Decimal
from extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_cors import cross_origin

wallet_bp = Blueprint("wallet", __name__)

@wallet_bp.route("/", methods=["GET"])
@jwt_required()
@cross_origin(origins="http://localhost:8080")
def get_wallet():
    """
    Get the wallet information for the authenticated user and include the user's name and email.
    """
    user_id = get_jwt_identity()
    
    wallet = Wallet.query.filter_by(user_id=user_id).first()
    if not wallet:
        return jsonify({"error": "Wallet not found"}), 404
    
    user = User.query.get(user_id)
    
    # Prepare wallet data; append extra user details.
    wallet_data = wallet.to_dict()
    wallet_data["userName"] = user.name if user else "Unknown User"
    wallet_data["email"] = user.email if user else "No email provided"
    
    return jsonify(wallet_data), 200

@wallet_bp.route("/add", methods=["POST"])
@jwt_required()
@cross_origin(origins="http://localhost:8080")
def add_funds():
    """
    Add funds to the authenticated user's wallet.
    Expects a JSON payload with the key "amount".
    Also creates a transaction record for the deposit.
    """
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No JSON data provided"}), 400

    amount = data.get("amount")
    if amount is None:
        return jsonify({"error": "Amount is required"}), 400

    # Fetch or create the wallet.
    wallet = Wallet.query.filter_by(user_id=user_id).first()
    if wallet is None:
        wallet = Wallet(user_id=user_id, balance=Decimal("0.00"))
        db.session.add(wallet)
        db.session.flush()  # Flush to assign an ID to wallet for the transaction record.
    
    try:
        deposit = Decimal(amount)
        wallet.balance += deposit
    except Exception as e:
        return jsonify({"error": "Invalid amount format", "message": str(e)}), 400

    # Create a transaction record.
    # The update: importing the correct class name PaymentTransaction.
    from models.payment_transaction import PaymentTransaction
    transaction = PaymentTransaction(
        wallet_id=wallet.id,
        amount=deposit,
        transaction_type="CREDIT",
        description="Added funds to wallet"
    )
    db.session.add(transaction)

    # Commit the transaction so that changes are saved.
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to add funds", "details": str(e)}), 500

    return jsonify({"message": "Funds added", "wallet": wallet.to_dict()}), 200
