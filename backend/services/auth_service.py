# services/auth_service.py

import logging
from datetime import date
from sqlalchemy.exc import SQLAlchemyError

from extensions import db
from models.user import User, UserRole
from models.wallet import Wallet
from security.password_utils import hash_password, verify_password
from security.jwt_auth import create_access_token

from exceptions.auth_exceptions import (
    DuplicateUserError,
    UnauthorizedAdminRegistrationError,
    InvalidGenderError,
    InvalidDOBError,
    LoginError,
    UserNotFoundError
)

logger = logging.getLogger(__name__)


class AuthService:

    @staticmethod
    def register_user(data):
        try:
            AuthService._check_duplicate_user(data)
            dob = AuthService._parse_dob(data.get("dob"))
            gender = AuthService._parse_gender(data.get("gender"))

            user = User(
                name=data["name"],
                email=data["email"],
                mobile_number=data["mobile_number"],
                password_hash=hash_password(data["password"]),
                role=UserRole.CUSTOMER,
                dob=dob,
                address=data.get("address"),
                zip_code=data.get("zip_code"),
                gender=gender
            )

            db.session.add(user)
            db.session.commit()

            wallet = Wallet(user_id=user.id, balance=0.00)
            db.session.add(wallet)
            db.session.commit()

            logger.info(f"Customer registered: {user.email}")
            return {"message": "User registered successfully"}, 201

        except (DuplicateUserError, InvalidDOBError, InvalidGenderError) as e:
            logger.warning(str(e))
            raise
        except SQLAlchemyError as e:
            logger.error(f"Database error during user registration: {e}")
            db.session.rollback()
            raise

    @staticmethod
    def register_admin(data):
        try:
            if data.get("admin_secret") != "myadminsecret":
                raise UnauthorizedAdminRegistrationError()

            AuthService._check_duplicate_user(data)
            dob = AuthService._parse_dob(data.get("dob"))
            gender = AuthService._parse_gender(data.get("gender"))

            user = User(
                name=data["name"],
                email=data["email"],
                mobile_number=data["mobile_number"],
                password_hash=hash_password(data["password"]),
                role=UserRole.ADMIN,
                dob=dob,
                address=data.get("address"),
                zip_code=data.get("zip_code"),
                gender=gender
            )

            db.session.add(user)
            db.session.commit()

            wallet = Wallet(user_id=user.id, balance=0.00)
            db.session.add(wallet)
            db.session.commit()

            logger.info(f"Admin registered: {user.email}")
            return {"message": "Admin user registered successfully", "admin_id": user.id}, 201

        except (DuplicateUserError, UnauthorizedAdminRegistrationError, InvalidDOBError, InvalidGenderError) as e:
            logger.warning(str(e))
            raise
        except SQLAlchemyError as e:
            logger.error(f"Database error during admin registration: {e}")
            db.session.rollback()
            raise

    @staticmethod
    def login_user(data):
        user = User.query.filter_by(email=data["email"]).first()
        if not user or not verify_password(data["password"], user.password_hash):
            logger.warning(f"Failed login for email: {data.get('email')}")
            raise LoginError()

        claims = {
            "role": user.role.value,
            "name": user.name
        }
        token = create_access_token(user.id, additional_claims=claims)
        logger.info(f"User logged in: {user.email}")
        return {"access_token": token}, 200

    @staticmethod
    def get_user_profile(user_id):
        user = User.query.get(user_id)
        if not user:
            logger.warning(f"User not found: {user_id}")
            raise UserNotFoundError()

        logger.info(f"Profile fetched for user: {user_id}")
        return user.to_dict(), 200

    @staticmethod
    def update_user(user_id, data):
        user = User.query.get(user_id)
        if not user:
            raise UserNotFoundError()

        user.name = data.get("name", user.name)
        user.email = data.get("email", user.email)
        user.mobile_number = data.get("mobile_number", user.mobile_number)

        if data.get("dob"):
            user.dob = AuthService._parse_dob(data["dob"])

        if data.get("gender"):
            user.gender = AuthService._parse_gender(data["gender"])

        user.address = data.get("address", user.address)
        user.zip_code = data.get("zip_code", user.zip_code)

        db.session.commit()
        logger.info(f"User updated: {user.email}")
        return {"message": "User updated successfully"}, 200

    # --- Helper Methods ---
    @staticmethod
    def _check_duplicate_user(data):
        if User.query.filter_by(email=data["email"]).first() or \
           User.query.filter_by(mobile_number=data["mobile_number"]).first():
            raise DuplicateUserError()

    @staticmethod
    def _parse_dob(dob_str):
        if not dob_str:
            return None
        try:
            return date.fromisoformat(dob_str)
        except Exception:
            raise InvalidDOBError()

    @staticmethod
    def _parse_gender(gender):
        if not gender:
            return None
        allowed = {"male", "female", "other"}
        gender_lc = gender.lower()
        if gender_lc not in allowed:
            raise InvalidGenderError()
        return gender_lc.upper()
