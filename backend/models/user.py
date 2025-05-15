# backend/models/user.py

from extensions import db
from models.enums import UserRole, Gender
from sqlalchemy import Enum as SqlEnum
from sqlalchemy import Sequence


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(
        db.Integer,
        Sequence('users_id_seq', start=1, increment=1),
        primary_key=True
    )

    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False, unique=True)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(SqlEnum(UserRole), nullable=False)
    gender = db.Column(SqlEnum(Gender), nullable=False)
    mobile_number = db.Column(db.String(10), nullable=False, unique=True)
    created_at = db.Column(db.Date, default=db.func.current_date())

    def __repr__(self):
        return f"<User {self.email}>"
    
    # TODO: Add methods like check_password() and serialize()
    # Marshmallow integration can be added if needed.
    