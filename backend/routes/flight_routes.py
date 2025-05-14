from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from backend.services.flight_service import (
    get_all_flights,  # Ensure this import is correct
    get_flight_by_id,
    create_flight,
    update_flight,
    delete_flight,
    search_flights
)

from backend.schemas.flight_schemas import (
    FlightCreateSchema, FlightResponseSchema, FlightUpdateSchema
)
from backend.exceptions.custom_exceptions import BadRequestError, NotFoundError
import logging
from datetime import datetime

flight_bp = Blueprint("flights", __name__, url_prefix="/api/flights")
logger = logging.getLogger(__name__)

@flight_bp.route("/", methods=["POST"])
@jwt_required()
def create():
    """Create a new flight."""
    try:
        data = request.get_json()
        validated_data = FlightCreateSchema().load(data)
        flight = create_flight(validated_data)
        return jsonify({
            "message": "Flight created successfully",
            "flight": FlightResponseSchema().dump(flight)
        }), 201  # HTTP 201: Created
    except BadRequestError as bre:
        logger.error(f"Bad Request: {str(bre)}")
        return jsonify({"error": str(bre)}), 400  # HTTP 400: Bad Request
    except Exception as e:
        logger.exception("Unexpected error during flight creation.")
        raise e

@flight_bp.route("/", methods=["GET"])
def get_all():
    """Get all flights."""
    try:
        flights = get_all_flights()
        return jsonify(FlightResponseSchema(many=True).dump(flights)), 200  # HTTP 200: OK
    except Exception as e:
        logger.exception("Failed to fetch all flights.")
        return jsonify({"error": "Internal server error"}), 500  # HTTP 500: Internal Server Error

@flight_bp.route("/<int:flight_id>", methods=["GET"])
def get_by_id(flight_id):
    """Get a flight by its ID."""
    try:
        flight = get_flight_by_id(flight_id)
        return jsonify(FlightResponseSchema().dump(flight)), 200  # HTTP 200: OK
    except NotFoundError as ne:
        logger.warning(f"Flight with ID {flight_id} not found.")
        return jsonify({"error": str(ne)}), 404  # HTTP 404: Not Found
    except Exception as e:
        logger.exception(f"Unexpected error fetching flight with ID {flight_id}.")
        return jsonify({"error": "Internal server error"}), 500  # HTTP 500: Internal Server Error

@flight_bp.route("/<int:flight_id>", methods=["PUT"])
@jwt_required()
def update(flight_id):
    """Update an existing flight."""
    try:
        data = request.get_json()
        validated_data = FlightUpdateSchema().load(data, partial=True)
        flight = update_flight(flight_id, validated_data)
        return jsonify({
            "message": "Flight updated successfully",
            "flight": FlightResponseSchema().dump(flight)
        }), 200  # HTTP 200: OK
    except NotFoundError as ne:
        logger.warning(f"Flight with ID {flight_id} not found for update.")
        return jsonify({"error": str(ne)}), 404  # HTTP 404: Not Found
    except BadRequestError as bre:
        logger.error(f"Bad Request: {str(bre)}")
        return jsonify({"error": str(bre)}), 400  # HTTP 400: Bad Request
    except Exception as e:
        logger.exception(f"Unexpected error during flight update (ID: {flight_id}).")
        return jsonify({"error": "Internal server error"}), 500  # HTTP 500: Internal Server Error

@flight_bp.route("/<int:flight_id>", methods=["DELETE"])
@jwt_required()
def delete(flight_id):
    """Delete a flight."""
    try:
        delete_flight(flight_id)
        return jsonify({"message": f"Flight {flight_id} deleted successfully"}), 204  # HTTP 204: No Content
    except NotFoundError as ne:
        logger.warning(f"Flight with ID {flight_id} not found for deletion.")
        return jsonify({"error": str(ne)}), 404  # HTTP 404: Not Found
    except Exception as e:
        logger.exception(f"Unexpected error during flight deletion (ID: {flight_id}).")
        return jsonify({"error": "Internal server error"}), 500  # HTTP 500: Internal Server Error


@flight_bp.route('/search', methods=['GET'])
def search():
    try:
        # Get the parameters from the request
        departure_airport_id = request.args.get('departure_airport_id', type=int)
        arrival_airport_id = request.args.get('arrival_airport_id', type=int)
        departure_time = request.args.get('departure_time')

        # If departure_time is provided, convert it to a datetime object
        if departure_time:
            departure_time = datetime.strptime(departure_time, "%Y-%m-%dT%H:%M:%S")
        else:
            departure_time = None  # Set to None if not provided

        # Call the search service
        flights = search_flights(departure_airport_id, arrival_airport_id, departure_time)

        # Serialize the flights and return the result
        return jsonify([flight.serialize() for flight in flights]), 200

    except Exception as e:
        logger.error(f"Failed to search for flights: {e}")
        return jsonify({"error": str(e)}), 500
