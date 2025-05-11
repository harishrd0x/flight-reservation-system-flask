from flask import jsonify
from werkzeug.exceptions import HTTPException

# TODO: Add more custom error classes and register them here if needed
def register_error_handlers(app):
    """Register generic and HTTP-specific error handlers."""

    @app.errorhandler(HTTPException)
    def handle_http_exception(e):
        response = {
            "error": e.name,
            "description": e.description,
            "status_code": e.code,
        }
        return jsonify(response), e.code

    @app.errorhandler(Exception)
    def handle_generic_exception(e):
        # TODO: Log the actual stack trace in production
        response = {
            "error": "Internal Server Error",
            "description": str(e),
            "status_code": 500,
        }
        return jsonify(response), 500
