# backend/exceptions/handlers.py
# Clean way to handle errors globally instead of repeating try/except

from flask import jsonify

def register_error_handlers(app):

    @app.errorhandler(404)
    def not_found_error(error):
        return jsonify({"error": "Not found"}), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({"error": "Something went wrong"}), 500

    # TODO: Add more granular error handling



'''
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

'''