from flask import Blueprint, request, jsonify
from models.review import Review
from models.user import User  # Import User model
from extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity

review_bp = Blueprint("review", __name__)

def is_admin(user_id):
    user = User.query.get(user_id)
    return user and user.role == "admin"

@review_bp.route("/", methods=["GET"])
@jwt_required()
def get_reviews():
    """
    Admin: get all reviews.
    Customer: get only their own reviews.
    """
    user_id = get_jwt_identity()

    if is_admin(user_id):
        reviews = Review.query.all()
    else:
        reviews = Review.query.filter_by(user_id=user_id).all()

    return jsonify([review.to_dict() for review in reviews]), 200

@review_bp.route("/", methods=["POST"])
@jwt_required()
def create_review():
    """
    Create a new review for a booking.
    """
    data = request.json
    user_id = get_jwt_identity()

    review = Review(
        user_id=user_id,
        booking_id=data.get("booking_id"),
        rating=data.get("rating"),
        comment=data.get("comment")
    )
    db.session.add(review)
    db.session.commit()

    return jsonify({"message": "Review submitted", "review": review.to_dict()}), 201
