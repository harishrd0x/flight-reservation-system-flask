from passlib.context import CryptContext

# Initialize password hashing utility
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Hashes a password securely using bcrypt."""
    return pwd_context.hash(password)

def verify_password(password: str, hashed_password: str) -> bool:
    """Verifies if a given password matches the stored hash."""
    return pwd_context.verify(password, hashed_password)
