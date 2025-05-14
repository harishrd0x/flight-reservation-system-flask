# airplane_routes.py
from flask import Blueprint, request, jsonify
from flask_cors import CORS
from models.airplane import Airplane
from extensions import db
from flask_jwt_extended import jwt_required, get_jwt

airplane_bp = Blueprint("airplane", __name__)
CORS(airplane_bp)

def is_admin():
    """
    Returns True if the JWT claims include a role of ADMIN.
    """
    claims = get_jwt()
    return claims.get("role", "").upper() == "ADMIN"

@airplane_bp.route("/", methods=["OPTIONS"])
def airplane_options():
    response = jsonify({})
    response.headers.add("Access-Control-Allow-Origin", "http://localhost:8080")
    response.headers.add("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
    return response, 200

# Anyone can view the airplanes:
@airplane_bp.route("/", methods=["GET"])
def get_airplanes():
    airplanes = Airplane.query.all()
    airplanes_data = [airplane.to_dict() for airplane in airplanes]
    return jsonify(airplanes_data), 200

# Admin-only: Create a new airplane:
@airplane_bp.route("/", methods=["POST"])
@jwt_required()  # Require a valid JWT
def create_airplane():
    if not is_admin():
        return jsonify({"error": "Unauthorized. Only admins can perform this action."}), 403

    data = request.json
    airplane = Airplane(
        model=data.get("model"),
        airline=data.get("airline"),
        capacity=data.get("capacity"),
        manufacture=data.get("manufacture")
    )
    db.session.add(airplane)
    db.session.commit()
    return jsonify({"message": "Airplane created successfully", "id": airplane.id}), 201

# Admin-only: Delete an airplane:
@airplane_bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_airplane(id):
    if not is_admin():
        return jsonify({"error": "Unauthorized. Only admins can perform this action."}), 403

    airplane = Airplane.query.get(id)
    if not airplane:
        return jsonify({"error": "Airplane not found"}), 404
    db.session.delete(airplane)
    db.session.commit()
    return jsonify({"message": "Airplane deleted successfully"}), 200
