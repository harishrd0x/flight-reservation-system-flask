# security/jwt_auth.py
from flask_jwt_extended import create_access_token as flask_create_access_token, decode_token
from config import Config

def create_access_token(user_id: int, additional_claims: dict = None) -> str:
    """
    Generate a JWT access token for the given user_id using Flask-JWT-Extended.
    The user_id is converted to a string and additional claims (e.g. role, name) are included.
    """
    identity_value = str(user_id)
    print("[JWT] Creating token with identity:", identity_value, "type:", type(identity_value))
    
    token = flask_create_access_token(identity=identity_value, additional_claims=additional_claims)
    print("[JWT] Generated token:", token)
    
    return token

def decode_access_token(token: str):
    """
    Decode a JWT access token using Flask-JWT-Extended.
    Returns the decoded payload if successful; otherwise returns None.
    """
    try:
        payload = decode_token(token)
        return payload
    except Exception as e:
        print("[JWT] Token decode error:", e)
        return None
