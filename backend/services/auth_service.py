# backend/services/auth_service.py

import logging
from datetime import timedelta

from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token

from backend.extensions import db
from backend.models.user import User
from backend.models.enums import UserRole, Gender

from backend.exceptions.custom_exceptions import (
    InvalidEnumError,
    UserAlreadyExistsError,
    InvalidCredentialsError,
)
from backend.exceptions.error_codes import INTERNAL_SERVER_ERROR


# Configure logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def register_user(data):
    """
    Create a new user in the database.
    Raises custom exceptions on error.
    """
    try:
        role = UserRole(data["role"])
        gender = Gender(data["gender"])
    except ValueError:
        logger.warning("Invalid role or gender provided.")
        raise InvalidEnumError()

    user = User(
        name=data["name"],
        email=data["email"],
        password=generate_password_hash(data["password"]),
        role=role,
        gender=gender,
        mobile_number=data["mobile_number"]
    )

    try:
        logger.info(f"Attempting to register user: {user.email}")
        db.session.add(user)
        db.session.commit()
        logger.info(f"User {user.email} successfully registered.")
    except IntegrityError as e:
        db.session.rollback()
        logger.error(f"Integrity error while registering user: {str(e)}")
        raise UserAlreadyExistsError()

    token = create_access_token(identity=user.id, expires_delta=timedelta(hours=1))
    return {
        "id": user.id,
        "email": user.email,
        "token": token
    }


def login_user(data):
    """
    Validate email and password. Raises InvalidCredentialsError on failure.
    """
    email = data['email']
    password = data['password']

    logger.info(f"Login attempt for email: {email}")
    user = User.query.filter_by(email=email).first()

    if not user:
        logger.warning(f"Login failed: No user with email {email}")
        raise InvalidCredentialsError()

    if not check_password_hash(user.password, password):
        logger.warning(f"Login failed: Incorrect password for {email}")
        raise InvalidCredentialsError()

    token = create_access_token(identity=user.id, expires_delta=timedelta(hours=1))
    logger.info(f"Login successful for {email}")

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "token": token
    }


def authenticate_user(email: str, password: str):
    """
    Used for internal authentication (if needed separately).
    Returns token+user info or raises InvalidCredentialsError.
    """
    try:
        user = User.query.filter_by(email=email).first()
        if not user or not check_password_hash(user.password, password):
            raise InvalidCredentialsError()

        access_token = create_access_token(identity=user.id, expires_delta=timedelta(hours=1))
        return {
            "access_token": access_token,
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role
            }
        }
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f"Database error during authentication: {str(e)}")
        raise Exception(INTERNAL_SERVER_ERROR)