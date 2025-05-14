# In models/user.py
from extensions import db
import enum
from sqlalchemy.types import TypeDecorator, String
from sqlalchemy import Sequence, CheckConstraint
from datetime import date

class CaseInsensitiveEnum(TypeDecorator):
    impl = String
    def __init__(self, enumtype, **kwargs):
        self.enumtype = enumtype
        super().__init__(**kwargs)
    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        if isinstance(value, self.enumtype):
            return value.value.upper()
        return str(value).upper()
    def process_result_value(self, value, dialect):
        if value is None:
            return None
        try:
            return self.enumtype(value.upper())
        except ValueError:
            raise ValueError(f"Value {value} is not a valid {self.enumtype}")

class UserRole(enum.Enum):
    CUSTOMER = "CUSTOMER"
    ADMIN = "ADMIN"

ALLOWED_GENDERS = ("MALE", "FEMALE", "OTHER")

class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, Sequence('users_seq', start=1, increment=1), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    mobile_number = db.Column(db.String(15), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(CaseInsensitiveEnum(UserRole, length=20), nullable=False, default=UserRole.CUSTOMER)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    dob = db.Column(db.Date, nullable=True)
    address = db.Column(db.String(255), nullable=True)
    zip_code = db.Column(db.String(20), nullable=True)
    gender = db.Column(db.String(10), nullable=True)
    __table_args__ = (
        CheckConstraint("gender IN ('MALE', 'FEMALE', 'OTHER')", name="chk_gender_valid"),
    )
    
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "mobile_number": self.mobile_number,
            "role": self.role.value,
            "dob": self.dob.isoformat() if self.dob else None,
            "address": self.address,
            "zip_code": self.zip_code,
            "gender": self.gender,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
