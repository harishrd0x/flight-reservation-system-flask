# backend/exceptions/error_handlers.py

from flask import jsonify
from werkzeug.exceptions import HTTPException
from exceptions.custom_exceptions import (
    BadRequestError,
    InvalidCredentialsError,
    UserAlreadyExistsError,
    InvalidEnumError,
    NotFoundError,
)
from exceptions.error_codes import (
    INVALID_CREDENTIALS,
    USER_ALREADY_EXISTS,
    INVALID_ROLE_OR_GENDER,
    NOT_FOUND,
    INTERNAL_SERVER_ERROR,
)

def register_error_handlers(app):
    # BadRequestError handler
    @app.errorhandler(BadRequestError)
    def handle_bad_request(error):
        response = jsonify({"status": "error", "message": str(error)})
        response.status_code = 400
        return response

    # Invalid Credentials handler
    @app.errorhandler(InvalidCredentialsError)
    def handle_invalid_credentials(err):
        return jsonify({"status": "error", "message": INVALID_CREDENTIALS}), 401

    # User Already Exists handler
    @app.errorhandler(UserAlreadyExistsError)
    def handle_user_exists(err):
        return jsonify({"status": "error", "message": USER_ALREADY_EXISTS}), 400

    # Invalid Enum handler
    @app.errorhandler(InvalidEnumError)
    def handle_invalid_enum(err):
        return jsonify({"status": "error", "message": INVALID_ROLE_OR_GENDER}), 400

    # Not Found handler
    @app.errorhandler(NotFoundError)
    def handle_not_found(err):
        return jsonify({"status": "error", "message": NOT_FOUND}), 404

    # HTTP Exception handler
    @app.errorhandler(HTTPException)
    def handle_http_exception(err):
        return jsonify({"status": "error", "message": err.description}), err.code

    # General Exception handler (Unexpected errors)
    @app.errorhandler(Exception)
    def handle_unexpected_exception(err):
        return jsonify({"status": "error", "message": INTERNAL_SERVER_ERROR}), 500
