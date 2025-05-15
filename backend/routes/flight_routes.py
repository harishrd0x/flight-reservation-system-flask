import logging
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from services.flight_service import (
    create_flight,
    get_all_flights,
    create_or_update_flight_price
)
from utils.role_checker import is_admin
from exceptions.custom_exceptions import UnauthorizedError, BadRequestError, NotFoundError

logger = logging.getLogger(__name__)
flight_bp = Blueprint("flight_bp", __name__, url_prefix="/flights")

@flight_bp.route("/", methods=["POST"])
@jwt_required()
def create_new_flight():
    if not is_admin():
        logger.warning("Unauthorized attempt to create a flight")
        raise UnauthorizedError("Only admins can perform this action.")

    data = request.get_json()
    logger.info(f"Received flight creation data: {data}")

    try:
        flight = create_flight(data)
    except ValueError as e:
        logger.error(f"Invalid input data: {e}")
        raise BadRequestError(str(e))

    logger.info(f"Flight created with ID: {flight.id}")
    return jsonify({"message": "Flight created successfully", "flight": flight.to_dict()}), 201

@flight_bp.route("/", methods=["GET"])
def list_flights():
    logger.info("Fetching all flights")
    flights = get_all_flights()
    return jsonify(flights), 200

@flight_bp.route("/prices", methods=["POST"])
@jwt_required()
def add_or_update_flight_price():
    if not is_admin():
        logger.warning("Unauthorized attempt to modify flight price")
        raise UnauthorizedError("Only admins can perform this action.")

    data = request.get_json()
    logger.info(f"Received flight price data: {data}")

    try:
        flight_price, status = create_or_update_flight_price(data)
    except (ValueError, NotFoundError) as e:
        logger.error(f"Error handling flight price: {e}")
        raise BadRequestError(str(e))

    msg = "Flight price updated successfully" if status == "updated" else "Flight price created successfully"
    status_code = 200 if status == "updated" else 201

    return jsonify({"message": msg, "flight_price": flight_price.to_dict()}), status_code
