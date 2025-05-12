# backend/wsgi.py
# WSGI entry point for the Flask application
# Entry point when deploying the app with a WSGI server like Gunicorn or uWSGI

from backend.app import create_app

app = create_app()

if __name__ == "__main__":
    # For local testing only
    app.run(debug=False, use_reloader=False)  # TODO: Set debug=True only in development # TODO: Use a proper server (Gunicorn) in production