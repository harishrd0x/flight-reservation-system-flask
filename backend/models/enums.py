from enum import Enum

class UserRole(str, Enum):
    ADMIN = "ADMIN"
    USER = "USER"

class Gender(str, Enum):
    M = "M"
    F = "F"
    O = "O"  # Optional: for "Other"

class FlightStatus(str, Enum):
    ACTIVE = "ACTIVE"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

# class FlightClass(str, Enum):
#     ECONOMY = "ECONOMY"
#     BUSINESS = "BUSINESS"
#     FIRST_CLASS = "FIRST_CLASS"

class BookingStatusEnum(str, Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    CANCELLED = "CANCELLED"

class PassengerStatusEnum(str, Enum):
    BOOKED = "BOOKED"
    CANCELLED = "CANCELLED"