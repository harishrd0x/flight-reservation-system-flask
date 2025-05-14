# auth_routes.py
from flask import Blueprint, request, jsonify
from models.user import User, UserRole
from models.wallet import Wallet
from extensions import db
from security.password_utils import hash_password, verify_password
from security.jwt_auth import create_access_token
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import date

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    """
    Register a new customer user along with their wallet.
    Expects JSON payload with keys: name, email, mobile_number, password, dob (optional),
    address (optional), zip_code (optional), gender (optional).
    This endpoint always creates a CUSTOMER.
    """
    data = request.json

    if User.query.filter_by(email=data["email"]).first() or \
       User.query.filter_by(mobile_number=data["mobile_number"]).first():
        return jsonify({"error": "Email or mobile number already exists"}), 400

    hashed_pwd = hash_password(data["password"])
    role = UserRole.CUSTOMER

    dob_value = data.get("dob")
    if dob_value:
        try:
            dob_parsed = date.fromisoformat(dob_value)
        except Exception:
            return jsonify({"error": "DOB must be in ISO format (YYYY-MM-DD)."}), 400
    else:
        dob_parsed = None

    input_gender = data.get("gender")
    gender_value = None
    if input_gender:
        allowed_genders = ["male", "female", "other"]
        lower_gender = input_gender.lower()
        if lower_gender not in allowed_genders:
            return jsonify({"error": "Invalid gender value. Allowed values: male, female, other."}), 400
        gender_value = lower_gender.upper()

    user = User(
        name=data["name"],
        email=data["email"],
        mobile_number=data["mobile_number"],
        password_hash=hashed_pwd,
        role=role,
        dob=dob_parsed,
        address=data.get("address"),
        zip_code=data.get("zip_code"),
        gender=gender_value
    )
    db.session.add(user)
    db.session.commit()

    wallet = Wallet(
        user_id=user.id,
        balance=0.00
    )
    db.session.add(wallet)
    db.session.commit()

    return jsonify({"message": "User registered successfully"}), 201

@auth_bp.route("/admin/register", methods=["POST"])
def admin_register():
    """
    [For testing only]
    Registers an admin user when a special 'admin_secret' is provided.
    Expects JSON payload with keys: admin_secret, name, email, mobile_number, password, etc.
    """
    data = request.json
    if data.get("admin_secret") != "myadminsecret":
        return jsonify({"error": "Unauthorized to register admin"}), 403

    if User.query.filter_by(email=data["email"]).first() or \
       User.query.filter_by(mobile_number=data["mobile_number"]).first():
        return jsonify({"error": "Email or mobile number already exists"}), 400

    hashed_pwd = hash_password(data["password"])
    role = UserRole.ADMIN  # Notice that this will create an admin user.

    dob_value = data.get("dob")
    if dob_value:
        try:
            dob_parsed = date.fromisoformat(dob_value)
        except Exception:
            return jsonify({"error": "DOB must be in ISO format (YYYY-MM-DD)."}), 400
    else:
        dob_parsed = None

    input_gender = data.get("gender")
    gender_value = None
    if input_gender:
        allowed_genders = ["male", "female", "other"]
        lower_gender = input_gender.lower()
        if lower_gender not in allowed_genders:
            return jsonify({"error": "Invalid gender value. Allowed values: male, female, other."}), 400
        gender_value = lower_gender.upper()

    user = User(
        name=data["name"],
        email=data["email"],
        mobile_number=data["mobile_number"],
        password_hash=hashed_pwd,
        role=role,
        dob=dob_parsed,
        address=data.get("address"),
        zip_code=data.get("zip_code"),
        gender=gender_value
    )
    db.session.add(user)
    db.session.commit()

    wallet = Wallet(
        user_id=user.id,
        balance=0.00
    )
    db.session.add(wallet)
    db.session.commit()

    return jsonify({"message": "Admin user registered successfully", "admin_id": user.id}), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Login user and return JWT token.
    Expects JSON payload with keys: email, password.
    The generated token includes additional claims: role and name.
    """
    data = request.json
    user = User.query.filter_by(email=data["email"]).first()
    if not user or not verify_password(data["password"], user.password_hash):
        return jsonify({"error": "Invalid credentials"}), 401

    additional_claims = {
        "role": user.role.value,
        "name": user.name
    }
    token = create_access_token(user.id, additional_claims=additional_claims)
    return jsonify({"access_token": token}), 200

@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    return jsonify({"message": "Logout successful"}), 200

@auth_bp.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    user_id_str = get_jwt_identity()
    try:
        user_id = int(user_id_str)
    except ValueError:
        return jsonify({"error": "Invalid user identity in token"}), 400

    user = User.query.get(user_id)
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

@auth_bp.route("/update", methods=["PUT"])
@jwt_required()
def update_user():
    current_user_id = get_jwt_identity()
    try:
        user_id = int(current_user_id)
    except ValueError:
        return jsonify({"error": "Invalid user identity in token"}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.json
    user.name = data.get("name", user.name)
    user.email = data.get("email", user.email)
    user.mobile_number = data.get("mobile_number", user.mobile_number)
    dob_value = data.get("dob")
    if dob_value:
        try:
            user.dob = date.fromisoformat(dob_value)
        except Exception:
            return jsonify({"error": "DOB must be in ISO format (YYYY-MM-DD)."}), 400
    user.address = data.get("address", user.address)
    user.zip_code = data.get("zip_code", user.zip_code)
    input_gender = data.get("gender")
    if input_gender:
        lower_gender = input_gender.lower()
        if lower_gender not in ["male", "female", "other"]:
            return jsonify({"error": "Invalid gender value. Allowed values: male, female, other."}), 400
        user.gender = lower_gender.upper()
    db.session.commit()
    return jsonify({"message": "User updated successfully"}), 200
