# backend/routes/flight_routes.py

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from backend.services.flight_service import (
    create_flight, get_all_flights, get_flight_by_id,
    update_flight, delete_flight
)
from backend.models.flight import Flight
from backend.schemas.flight_schemas import (
    FlightCreateSchema, FlightResponseSchema, FlightUpdateSchema
)
from backend.exceptions.custom_exceptions import BadRequestError, NotFoundError
import logging

flight_bp = Blueprint("flights", __name__, url_prefix="/api/flights")
logger = logging.getLogger(__name__)

@flight_bp.route("/", methods=["POST"])
@jwt_required()
def create():
    try:
        data = request.get_json()
        # Validate with Marshmallow schema
        schema = FlightCreateSchema()
        validated_data = schema.load(data)

        flight = create_flight(validated_data)
        return jsonify({
            "message": "Flight created successfully",
            "flight": FlightResponseSchema().dump(flight)
        }), 201

    except BadRequestError as bre:
        return jsonify({"error": str(bre)}), 400
    except Exception as e:
        raise e  # Global error handler

@flight_bp.route("/", methods=["GET"])
def get_all():
    try:
        flights = get_all_flights()
        return jsonify(FlightResponseSchema(many=True).dump(flights)), 200
    except Exception as e:
        logger.exception("Failed to fetch all flights.")
        raise e

@flight_bp.route("/<int:flight_id>", methods=["GET"])
def get_by_id(flight_id):
    try:
        flight = get_flight_by_id(flight_id)
        return jsonify(FlightResponseSchema().dump(flight)), 200
    except NotFoundError as ne:
        return jsonify({"error": str(ne)}), 404
    except Exception as e:
        raise e

@flight_bp.route("/<int:flight_id>", methods=["PUT"])
@jwt_required()
def update(flight_id):
    try:
        data = request.get_json()
        schema = FlightUpdateSchema()
        validated_data = schema.load(data, partial=True)

        flight = update_flight(flight_id, validated_data)
        return jsonify({
            "message": "Flight updated successfully",
            "flight": FlightResponseSchema().dump(flight)
        }), 200

    except NotFoundError as ne:
        return jsonify({"error": str(ne)}), 404
    except BadRequestError as bre:
        return jsonify({"error": str(bre)}), 400
    except Exception as e:
        raise e

@flight_bp.route("/<int:flight_id>", methods=["DELETE"])
@jwt_required()
def delete(flight_id):
    try:
        delete_flight(flight_id)
        return jsonify({"message": f"Flight {flight_id} deleted successfully"}), 200
    except NotFoundError as ne:
        return jsonify({"error": str(ne)}), 404
    except Exception as e:
        raise e
