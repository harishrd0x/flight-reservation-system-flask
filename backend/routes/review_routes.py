from flask import Blueprint, request, jsonify
from models.review import Review
from extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity

review_bp = Blueprint("review", __name__)

@review_bp.route("/", methods=["GET"])
def get_reviews():
    """
    Get all reviews.
    """
    reviews = Review.query.all()
    return jsonify([review.to_dict() for review in reviews]), 200

@review_bp.route("/", methods=["POST"])
@jwt_required()
def create_review():
    """
    Create a new review for a flight.
    """
    data = request.json
    user_id = get_jwt_identity()
    
    review = Review(
        user_id=user_id,
        flight_id=data.get("flight_id"),
        rating=data.get("rating"),
        comment=data.get("comment")
    )
    db.session.add(review)
    db.session.commit()

    return jsonify({"message": "Review submitted", "review": review.to_dict()}), 201
