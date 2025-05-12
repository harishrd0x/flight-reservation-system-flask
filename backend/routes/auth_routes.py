import logging
from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from backend.services.auth_service import register_user, login_user
from backend.schemas.auth_schemas import RegisterSchema, LoginSchema, AuthResponseSchema

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

# Configure route-level logger
logger = logging.getLogger(__name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    try:
        json_data = request.get_json()
        logger.info(f"Registration attempt for email: {json_data.get('email')}")

        # Validate input
        data = RegisterSchema().load(json_data)

        # Process
        user = register_user(data)

        # Return serialized output
        return jsonify({
            "message": "Registration successful",
            "user": AuthResponseSchema().dump(user)
        }), 201

    except ValidationError as ve:
        logger.warning(f"Validation failed during registration: {ve.messages}")
        return jsonify({"errors": ve.messages}), 400

    except ValueError as ve:
        logger.warning(f"Registration failed: {ve}")
        return jsonify({"error": str(ve)}), 400

    except Exception as e:
        logger.exception("Unexpected error during registration")
        raise e  # Global handler catches this

@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        json_data = request.get_json()
        logger.info(f"Login attempt for email: {json_data.get('email')}")

        # Validate input
        data = LoginSchema().load(json_data)

        # Process
        user = login_user(data)

        # Return serialized output
        return jsonify({
            "message": "Login successful",
            "user": AuthResponseSchema().dump(user)
        }), 200

    except ValidationError as ve:
        logger.warning(f"Validation failed during login: {ve.messages}")
        return jsonify({"errors": ve.messages}), 400

    except ValueError as ve:
        logger.warning(f"Login failed: {ve}")
        return jsonify({"error": str(ve)}), 401

    except Exception as e:
        logger.exception("Unexpected error during login")
        raise e  # Global handler catches this
