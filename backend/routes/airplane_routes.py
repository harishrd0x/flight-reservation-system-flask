import logging
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from services.airplane_service import get_all_airplanes, create_airplane, delete_airplane_by_id
from utils.role_checker import is_admin
from exceptions.custom_exceptions import UnauthorizedError, BadRequestError

logger = logging.getLogger(__name__)

airplane_bp = Blueprint("airplane", __name__, url_prefix="/airplanes")

@airplane_bp.route("/", methods=["GET"])
def get_airplanes():
    logger.info("Fetching all airplanes")
    airplanes = get_all_airplanes()
    return jsonify(airplanes), 200

@airplane_bp.route("/", methods=["POST"])
@jwt_required()
def add_airplane():
    if not is_admin():
        logger.warning("Unauthorized create airplane attempt")
        raise UnauthorizedError("Only admins can perform this action.")

    data = request.json
    if not data:
        logger.warning("No input data provided to create airplane")
        raise BadRequestError("No input data provided")

    logger.info(f"Creating airplane with data: {data}")
    airplane = create_airplane(data)
    logger.info(f"Airplane created with ID: {airplane.id}")

    return jsonify({"message": "Airplane created successfully", "id": airplane.id}), 201

@airplane_bp.route("/<int:airplane_id>", methods=["DELETE"])
@jwt_required()
def delete_airplane(airplane_id):
    if not is_admin():
        logger.warning(f"Unauthorized delete airplane attempt for id {airplane_id}")
        raise UnauthorizedError("Only admins can perform this action.")

    logger.info(f"Deleting airplane with ID: {airplane_id}")
    message = delete_airplane_by_id(airplane_id)
    logger.info(f"Deleted airplane with ID: {airplane_id}")

    return jsonify({"message": message}), 200
