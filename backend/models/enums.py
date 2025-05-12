from enum import Enum

class UserRole(str, Enum):
    ADMIN = "ADMIN"
    USER = "USER"

class Gender(str, Enum):
    M = "M"
    F = "F"
    O = "O"  # Optional: for "Other"
