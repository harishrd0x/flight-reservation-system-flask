from flask import Blueprint, request, jsonify
from flask_cors import CORS
from extensions import db
from models.airport import Airport
from flask_jwt_extended import jwt_required, get_jwt

airport_bp = Blueprint("airport_bp", __name__, url_prefix="/airports")
CORS(airport_bp)  # Enable CORS on this blueprint

def is_admin():
    """
    Returns True if the JWT token's claims indicate the user is an admin.
    Assumes that your JWT token includes a "role" claim.
    """
    claims = get_jwt()
    return claims.get("role", "").upper() == "ADMIN"

@airport_bp.route("/", methods=["OPTIONS"])
def handle_options():
    """Handle CORS preflight requests."""
    response = jsonify({"message": "CORS preflight handled"})
    response.headers.add("Access-Control-Allow-Origin", "http://localhost:8080")
    response.headers.add("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
    return response

@airport_bp.route("/", methods=["GET"])
def get_airports():
    """Fetch all airports (accessible to everyone)."""
    airports = Airport.query.all()
    airports_data = [airport.to_dict() for airport in airports]
    return jsonify(airports_data), 200

@airport_bp.route("/", methods=["POST"])
@jwt_required()  # Require a valid JWT token
def add_airport():
    """Add a new airport (admin only)."""
    if not is_admin():
        return jsonify({"error": "Unauthorized. Only admins can perform this action."}), 403

    data = request.json
    if not data:
        return jsonify({"error": "No input data provided"}), 400

    if Airport.query.filter_by(code=data.get("code")).first():
        return jsonify({"error": "Airport code already exists"}), 400

    new_airport = Airport(
        name=data["name"],
        code=data["code"],
        city=data["city"],
        country=data["country"]
    )
    db.session.add(new_airport)
    db.session.commit()

    return jsonify({"message": f"{data['name']} added successfully"}), 201

@airport_bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_airport(id):
    """Delete an airport (admin only)."""
    if not is_admin():
        return jsonify({"error": "Unauthorized. Only admins can perform this action."}), 403

    airport = Airport.query.get(id)
    if not airport:
        return jsonify({"error": "Airport not found"}), 404

    db.session.delete(airport)
    db.session.commit()
    return jsonify({"message": "Airport deleted successfully"}), 200
