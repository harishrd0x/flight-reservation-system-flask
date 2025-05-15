# routes/wallet_routes.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_cors import cross_origin
import logging

from services.wallet_service import WalletService
from exceptions.wallet_exceptions import WalletError

wallet_bp = Blueprint("wallet", __name__)
logger = logging.getLogger(__name__)


@wallet_bp.route("/", methods=["GET"])
@jwt_required()
@cross_origin(origins="http://localhost:8080")
def get_wallet():
    try:
        user_id = get_jwt_identity()
        return WalletService.get_wallet(user_id)
    except WalletError as e:
        logger.warning(f"Wallet error: {e.message}")
        return jsonify({"error": e.message}), e.status_code
    except Exception as e:
        logger.exception("Unexpected error fetching wallet")
        return jsonify({"error": "Internal server error"}), 500


@wallet_bp.route("/add", methods=["POST"])
@jwt_required()
@cross_origin(origins="http://localhost:8080")
def add_funds():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        return WalletService.add_funds(user_id, data)
    except WalletError as e:
        logger.warning(f"Add funds error: {e.message}")
        return jsonify({"error": e.message}), e.status_code
    except Exception as e:
        logger.exception("Unexpected error adding funds")
        return jsonify({"error": "Internal server error"}), 500
