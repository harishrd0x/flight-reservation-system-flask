import logging
from flask import jsonify
from models.review import Review
from extensions import db
from exceptions.review_exceptions import ReviewError

logger = logging.getLogger(__name__)

class ReviewService:
    @staticmethod
    def get_reviews(user_id, is_admin=False):
        try:
            if is_admin:
                reviews = Review.query.all()
            else:
                reviews = Review.query.filter_by(user_id=user_id).all()

            return jsonify([r.to_dict() for r in reviews]), 200
        except Exception as e:
            logger.error("Failed to fetch reviews", exc_info=True)
            raise ReviewError("Error retrieving reviews", 500)

    @staticmethod
    def create_review(user_id, data):
        required_fields = {"booking_id", "rating", "comment"}
        if not data or not required_fields.issubset(data):
            raise ReviewError("Missing required fields", 400)

        try:
            review = Review(
                user_id=user_id,
                booking_id=data["booking_id"],
                rating=data["rating"],
                comment=data["comment"]
            )
            db.session.add(review)
            db.session.commit()

            return jsonify({"message": "Review submitted", "review": review.to_dict()}), 201
        except Exception as e:
            db.session.rollback()
            logger.error("Failed to create review", exc_info=True)
            raise ReviewError("Error submitting review", 500)
