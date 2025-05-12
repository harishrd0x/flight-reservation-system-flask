# backend/services/auth_service.py

# backend/services/auth_service.py

from werkzeug.security import check_password_hash
from models.user import User
from extensions.extensions import db
from flask_jwt_extended import create_access_token
from datetime import timedelta
from sqlalchemy.exc import SQLAlchemyError

def authenticate_user(email: str, password: str):
    try:
        user = User.query.filter_by(email=email).first()

        if not user:
            return None, "Invalid email or password"

        if not check_password_hash(user.password, password):
            return None, "Invalid email or password"

        # Token expires in 1 day — can customize
        access_token = create_access_token(identity=user.id, expires_delta=timedelta(days=1))
        return {
            "access_token": access_token,
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role
            }
        }, None
    except SQLAlchemyError:
        db.session.rollback()
        return None, "Internal server error"

# TODO: Add login_user() for login logic
# TODO: Add input validation, email verification, and password hashing later


'''
# TODO: Add input validation, email verification, and password hashing later

def register_user(data):
    # Placeholder logic — will connect with the User model
    return {
        "username": data["username"],
        "email": data["email"]
    }

'''