from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from services.airport_service import get_all_airports, create_airport, delete_airport_by_id
from utils.role_checker import is_admin
from exceptions.custom_exceptions import UnauthorizedError, NotFoundError, BadRequestError

airport_bp = Blueprint("airport", __name__, url_prefix="/airports")


@airport_bp.route("/", methods=["GET"])
def get_airports():
    airports = get_all_airports()
    return jsonify(airports), 200


@airport_bp.route("/", methods=["POST"])
@jwt_required()
def add_airport():
    try:
        if not is_admin():
            raise UnauthorizedError("Only admins can perform this action.")

        data = request.json
        if not data:
            raise BadRequestError("No input data provided")

        airport = create_airport(data)
        return jsonify({"message": f"{airport.name} added successfully"}), 201

    except UnauthorizedError as e:
        return jsonify({"error": str(e)}), 403

    except BadRequestError as e:
        return jsonify({"error": str(e)}), 400


@airport_bp.route("/<int:airport_id>", methods=["DELETE"])
@jwt_required()
def delete_airport(airport_id):
    try:
        if not is_admin():
            raise UnauthorizedError("Only admins can perform this action.")

        message = delete_airport_by_id(airport_id)
        return jsonify({"message": message}), 200

    except UnauthorizedError as e:
        return jsonify({"error": str(e)}), 403

    except NotFoundError as e:
        return jsonify({"error": str(e)}), 404
