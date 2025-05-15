# routes/auth_routes.py

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from services.auth_service import AuthService
from exceptions.auth_exceptions import AuthError

import logging

auth_bp = Blueprint("auth", __name__)
logger = logging.getLogger(__name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    """
    Register a new customer.
    JSON: name, email, mobile_number, password, dob, address, zip_code, gender
    """
    try:
        data = request.get_json()
        return AuthService.register_user(data)
    except AuthError as e:
        logger.warning(f"Registration error: {e.message}")
        return jsonify({"error": e.message}), e.status_code
    except Exception as e:
        logger.exception("Unexpected error during registration")
        return jsonify({"error": "Internal server error"}), 500


@auth_bp.route("/admin/register", methods=["POST"])
def admin_register():
    """
    Register a new admin (dev/testing use).
    JSON: admin_secret, name, email, mobile_number, password, ...
    """
    try:
        data = request.get_json()
        return AuthService.register_admin(data)
    except AuthError as e:
        logger.warning(f"Admin registration error: {e.message}")
        return jsonify({"error": e.message}), e.status_code
    except Exception as e:
        logger.exception("Unexpected error during admin registration")
        return jsonify({"error": "Internal server error"}), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Log in a user and return access token.
    JSON: email, password
    """
    try:
        data = request.get_json()
        return AuthService.login_user(data)
    except AuthError as e:
        logger.warning(f"Login error: {e.message}")
        return jsonify({"error": e.message}), e.status_code
    except Exception as e:
        logger.exception("Unexpected error during login")
        return jsonify({"error": "Internal server error"}), 500


@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    # Placeholder — real token blacklisting would be needed
    return jsonify({"message": "Logout successful"}), 200


@auth_bp.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    try:
        user_id = int(get_jwt_identity())
        return AuthService.get_user_profile(user_id)
    except ValueError:
        return jsonify({"error": "Invalid user identity in token"}), 400
    except AuthError as e:
        logger.warning(f"Profile fetch error: {e.message}")
        return jsonify({"error": e.message}), e.status_code
    except Exception as e:
        logger.exception("Unexpected error fetching profile")
        return jsonify({"error": "Internal server error"}), 500


@auth_bp.route("/update", methods=["PUT"])
@jwt_required()
def update_user():
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json()
        return AuthService.update_user(user_id, data)
    except ValueError:
        return jsonify({"error": "Invalid user identity in token"}), 400
    except AuthError as e:
        logger.warning(f"Update error: {e.message}")
        return jsonify({"error": e.message}), e.status_code
    except Exception as e:
        logger.exception("Unexpected error updating user")
        return jsonify({"error": "Internal server error"}), 500
