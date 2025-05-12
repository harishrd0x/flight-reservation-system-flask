# backend/routes/auth_routes.py

from flask import Blueprint, request, jsonify
from backend.schemas.auth_schema import RegisterUserSchema
from backend.services.auth_service import register_user
import logging

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")
logger = logging.getLogger(__name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    schema = RegisterUserSchema()
    data = request.get_json()
    errors = schema.validate(data)

    if errors:
        return jsonify({"errors": errors}), 400

    try:
        result = register_user(data)
        logger.info(f"User {result['email']} registered successfully")
        return jsonify({"message": "Registration successful", "user": result}), 201
    except ValueError as e:
        logger.warning(f"Registration failed: {str(e)}")
        return jsonify({"error": str(e)}), 400

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    result, error = authenticate_user(email, password)

    if error:
        return jsonify({"error": error}), 401

    return jsonify(result), 200

# TODO: Add /login route later