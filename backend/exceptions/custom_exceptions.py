# exceptions/custom_exceptions.py

class ApplicationError(Exception):
    """Base class for custom application errors."""
    pass

class InvalidCredentialsError(ApplicationError):
    pass

class UserAlreadyExistsError(ApplicationError):
    pass

class InvalidEnumError(ApplicationError):
    pass

class NotFoundError(ApplicationError):
    pass
