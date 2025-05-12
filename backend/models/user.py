# backend/models/user.py

from backend.extensions import db
from datetime import datetime, timezone

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)
    role = db.Column(db.Enum("USER", "ADMIN", name="user_roles"), nullable=False)
    gender = db.Column(db.String(1), nullable=False)
    mobile_number = db.Column(db.String(10), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))  # ✅ FIXED

    def __repr__(self):
        return f"<User {self.email}>"
    
# TODO: Add methods like check_password() and serialize() if needed for reuse in APIs
# marshmallow?