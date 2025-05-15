import logging
from flask import jsonify
from exceptions.custom_exceptions import BadRequestError, NotFoundError, UnauthorizedError

logger = logging.getLogger(__name__)

def register_error_handlers(app):
    @app.errorhandler(BadRequestError)
    def handle_bad_request(e):
        logger.warning(f"BadRequestError: {e}")
        return jsonify({"error": str(e)}), 400

    @app.errorhandler(NotFoundError)
    def handle_not_found(e):
        logger.warning(f"NotFoundError: {e}")
        return jsonify({"error": str(e)}), 404

    @app.errorhandler(UnauthorizedError)
    def handle_unauthorized(e):
        logger.warning(f"UnauthorizedError: {e}")
        return jsonify({"error": str(e)}), 403

    @app.errorhandler(500)
    def handle_internal_error(e):
        logger.error(f"Internal Server Error: {e}", exc_info=True)
        return jsonify({"error": "Internal Server Error"}), 500
