# backend/routes/auth_routes.py

import logging
from flask import Blueprint, request, jsonify
from backend.services.auth_service import register_user
from backend.schemas.auth_schemas import RegisterUserSchema

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

# DO NOT use basicConfig here — the app's logging config is already set
logger = logging.getLogger(__name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    logger.info("🔐 Register route accessed")
    data = request.get_json()
    schema = RegisterUserSchema()
    validated_data = schema.load(data)
    user = register_user(validated_data)
    logger.info(f"✅ User {user['email']} registered successfully")  # Sample additional log
    return jsonify({"message": "User registered successfully", "user": user}), 201
