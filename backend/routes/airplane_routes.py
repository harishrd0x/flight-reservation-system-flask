# backend/routes/airplane_routes.py

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from backend.services.airplane_service import (
    create_airplane, get_all_airplanes, get_airplane_by_id,
    update_airplane, delete_airplane
)
from backend.schemas.airplane_schemas import AirplaneResponseSchema
from backend.exceptions.custom_exceptions import BadRequestError

airplane_bp = Blueprint("airplanes", __name__, url_prefix="/api/airplanes")

@airplane_bp.route("/", methods=["POST"])
@jwt_required()
def create():
    try:
        claims = get_jwt()
        if claims.get("role") != "ADMIN":
            raise BadRequestError("Unauthorized: Only admins can create airplanes.")

        data = request.get_json()
        airplane = create_airplane(data)
        return jsonify({
            "message": "Airplane created successfully",
            "airplane": airplane.serialize()
        }), 201
    except BadRequestError as bre:
        return jsonify({"error": str(bre)}), 400
    except Exception as e:
        raise e


@airplane_bp.route("/", methods=["GET"])
def list_airplanes():
    try:
        airplanes = get_all_airplanes()
        response = AirplaneResponseSchema(many=True).dump(airplanes)
        return jsonify(response), 200
    except Exception as e:
        raise e


@airplane_bp.route("/<int:airplane_id>", methods=["GET"])
def get_by_id(airplane_id):
    try:
        airplane = get_airplane_by_id(airplane_id)
        return jsonify(airplane.serialize()), 200
    except Exception as e:
        raise e


@airplane_bp.route("/<int:airplane_id>", methods=["PUT"])
@jwt_required()
def update(airplane_id):
    try:
        claims = get_jwt()
        if claims.get("role") != "ADMIN":
            raise BadRequestError("Unauthorized: Only admins can update airplanes.")

        data = request.get_json()
        airplane = update_airplane(airplane_id, data)
        return jsonify({
            "message": "Airplane updated successfully",
            "airplane": airplane.serialize()
        }), 200
    except BadRequestError as bre:
        return jsonify({"error": str(bre)}), 400
    except Exception as e:
        raise e


@airplane_bp.route("/<int:airplane_id>", methods=["DELETE"])
@jwt_required()
def delete(airplane_id):
    try:
        claims = get_jwt()
        if claims.get("role") != "ADMIN":
            raise BadRequestError("Unauthorized: Only admins can delete airplanes.")

        delete_airplane(airplane_id)
        return jsonify({"message": "Airplane deleted successfully"}), 200
    except BadRequestError as bre:
        return jsonify({"error": str(bre)}), 400
    except Exception as e:
        raise e
