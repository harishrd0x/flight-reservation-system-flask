# backend/exceptions/handlers.py
# Clean way to handle errors globally instead of repeating try/except

# exceptions/error_handlers.py

from flask import jsonify
from werkzeug.exceptions import HTTPException
from backend.exceptions.custom_exceptions import (
    InvalidCredentialsError,
    UserAlreadyExistsError,
    InvalidEnumError,
    NotFoundError,
)
from backend.exceptions.error_codes import (
    INVALID_CREDENTIALS,
    USER_ALREADY_EXISTS,
    INVALID_ROLE_OR_GENDER,
    NOT_FOUND,
    INTERNAL_SERVER_ERROR,
)

def register_error_handlers(app):
    @app.errorhandler(InvalidCredentialsError)
    def handle_invalid_credentials(err):
        return jsonify({"error": INVALID_CREDENTIALS}), 401

    @app.errorhandler(UserAlreadyExistsError)
    def handle_user_exists(err):
        return jsonify({"error": USER_ALREADY_EXISTS}), 400

    @app.errorhandler(InvalidEnumError)
    def handle_invalid_enum(err):
        return jsonify({"error": INVALID_ROLE_OR_GENDER}), 400

    @app.errorhandler(NotFoundError)
    def handle_not_found(err):
        return jsonify({"error": NOT_FOUND}), 404

    @app.errorhandler(HTTPException)
    def handle_http_exception(err):
        return jsonify({"error": err.description}), err.code

    @app.errorhandler(Exception)
    def handle_unexpected_exception(err):
        return jsonify({"error": INTERNAL_SERVER_ERROR}), 500


    # TODO: Add more granular error handling