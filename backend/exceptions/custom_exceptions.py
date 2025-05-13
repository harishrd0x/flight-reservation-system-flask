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

class BadRequestError(Exception):
    """Exception raised for invalid data or bad request."""
    def __init__(self, message):
        self.message = message
        super().__init__(self.message)
