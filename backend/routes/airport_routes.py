# backend/routes/airport_routes.py

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from backend.services.airport_service import (
    create_airport,
    get_airport_by_id,
    get_airport_by_code,
    update_airport,
    delete_airport
)
from backend.models.airport import Airport
from backend.exceptions.custom_exceptions import BadRequestError
import logging

airport_bp = Blueprint("airports", __name__, url_prefix="/api/airports")
logger = logging.getLogger(__name__)


def is_admin():
    claims = get_jwt()
    role = claims.get("role")
    if role != "ADMIN":
        raise BadRequestError("Unauthorized: Only admins can perform this operation.")


@airport_bp.route("/", methods=["POST"])
@jwt_required()
def create():
    try:
        is_admin()
        data = request.get_json()
        airport = create_airport(data)
        return jsonify({
            "message": "Airport created successfully",
            "airport": airport.serialize()
        }), 201
    except BadRequestError as bre:
        return jsonify({"error": str(bre)}), 400
    except Exception as e:
        raise e


@airport_bp.route("/", methods=["GET"])
def list_airports():
    try:
        airports = Airport.query.all()
        response = [airport.serialize() for airport in airports]
        return jsonify(response), 200
    except Exception as e:
        logger.exception("Unexpected error while fetching airports.")
        raise e


@airport_bp.route("/<int:id>", methods=["GET"])
def get_by_id(id):
    try:
        airport = get_airport_by_id(id)
        if not airport:
            return jsonify({"error": "Airport not found"}), 404
        return jsonify(airport.serialize()), 200
    except Exception as e:
        raise e


@airport_bp.route("/code/<string:code>", methods=["GET"])
def get_by_code(code):
    try:
        airport = get_airport_by_code(code.upper())
        if not airport:
            return jsonify({"error": "Airport not found"}), 404
        return jsonify(airport.serialize()), 200
    except Exception as e:
        raise e


@airport_bp.route("/<int:id>", methods=["PUT"])
@jwt_required()
def update(id):
    try:
        is_admin()
        data = request.get_json()
        airport = update_airport(id, data)
        return jsonify({
            "message": "Airport updated successfully",
            "airport": airport.serialize()
        }), 200
    except BadRequestError as bre:
        return jsonify({"error": str(bre)}), 400
    except Exception as e:
        raise e


@airport_bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
def delete(id):
    try:
        is_admin()
        delete_airport(id)
        return jsonify({"message": "Airport deleted successfully"}), 200
    except BadRequestError as bre:
        return jsonify({"error": str(bre)}), 400
    except Exception as e:
        raise e
