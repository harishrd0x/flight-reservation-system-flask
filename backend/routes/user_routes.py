from flask import Blueprint, request, jsonify
from models.user import User
from extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity

# Define the blueprint for user routes
user_bp = Blueprint("user", __name__)

@user_bp.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    """
    Get the profile of the currently authenticated user.
    """
    # Get the current user ID from the JWT token
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404

    user_data = {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "mobile_number": user.mobile_number,
        "dob": user.dob.isoformat() if user.dob else None,
        "address": user.address,
        "zip_code": user.zip_code,
        "gender": user.gender,
        "role": user.role.value if user.role else None,
        "created_at": user.created_at.isoformat() if user.created_at else None
    }
    return jsonify(user_data), 200

@user_bp.route("/update", methods=["PUT"])
@jwt_required()
def update_user():
    """
    Update the currently authenticated user's details.
    """
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.json

    # Update user fields if provided in the payload
    user.name = data.get("name", user.name)
    user.email = data.get("email", user.email)
    user.mobile_number = data.get("mobile_number", user.mobile_number)
    user.dob = data.get("dob", user.dob)             # Expect ISO formatted string or appropriate value
    user.address = data.get("address", user.address)
    user.zip_code = data.get("zip_code", user.zip_code)
    
    # Validate and update gender only if provided
    input_gender = data.get("gender")
    if input_gender:
        allowed_genders = ["MALE", "FEMALE", "other"]
        lower_gender = input_gender.lower()
        if lower_gender not in allowed_genders:
            return jsonify({"error": "Invalid gender value. Allowed values: male, female, other."}), 400
        user.gender = lower_gender

    db.session.commit()
    return jsonify({"message": "User updated successfully"}), 200
