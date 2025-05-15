# utils/roles_required.py
from flask_jwt_extended import verify_jwt_in_request, get_jwt
from functools import wraps
from werkzeug.exceptions import Forbidden

def role_required(required_role):
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            if claims.get("role") != required_role:
                raise Forbidden(f"{required_role} role required.")
            return fn(*args, **kwargs)
        return decorator
    return wrapper
