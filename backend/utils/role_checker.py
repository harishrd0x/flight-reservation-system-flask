from flask_jwt_extended import get_jwt

def is_admin():
    claims = get_jwt()
    return claims.get("role", "").upper() == "ADMIN"
