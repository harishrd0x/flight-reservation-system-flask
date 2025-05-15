# exceptions/auth_exceptions.py

class AuthError(Exception):
    """Base exception for auth-related errors."""
    def __init__(self, message="Authentication error", status_code=400):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class RegistrationError(AuthError):
    """Exception raised for registration errors."""
    def __init__(self, message="Registration failed"):
        super().__init__(message, status_code=400)


class DuplicateUserError(RegistrationError):
    def __init__(self):
        super().__init__("Email or mobile number already exists")


class UnauthorizedAdminRegistrationError(RegistrationError):
    def __init__(self):
        super().__init__("Unauthorized to register admin")


class InvalidGenderError(RegistrationError):
    def __init__(self):
        super().__init__("Invalid gender value. Allowed values: male, female, other.")


class InvalidDOBError(RegistrationError):
    def __init__(self):
        super().__init__("DOB must be in ISO format (YYYY-MM-DD).")


class LoginError(AuthError):
    def __init__(self):
        super().__init__("Invalid credentials", status_code=401)


class UserNotFoundError(AuthError):
    def __init__(self):
        super().__init__("User not found", status_code=404)
