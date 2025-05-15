from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from services.review_service import ReviewService
from exceptions.review_exceptions import ReviewError

review_bp = Blueprint("review", __name__, url_prefix="/reviews")

def is_admin():
    claims = get_jwt()
    return claims.get("role", "").upper() == "ADMIN"

@review_bp.route("/", methods=["GET"])
@jwt_required()
def get_reviews():
    try:
        user_id = get_jwt_identity()
        if not user_id:
            return jsonify({"error": "Invalid token: user id missing"}), 401

        return ReviewService.get_reviews(user_id, is_admin=is_admin())

    except ReviewError as e:
        return jsonify({"error": e.message}), e.status_code

@review_bp.route("/", methods=["POST"])
@jwt_required()
def create_review():
    try:
        user_id = get_jwt_identity()
        if not user_id:
            return jsonify({"error": "Invalid token: user id missing"}), 401

        data = request.get_json()
        return ReviewService.create_review(user_id, data)

    except ReviewError as e:
        return jsonify({"error": e.message}), e.status_code
