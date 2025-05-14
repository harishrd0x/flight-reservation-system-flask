import os

class Config:
    """Base configuration for the application."""
    SECRET_KEY = os.getenv("SECRET_KEY", "super_secret_key")
    
    # Database connection
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "oracle+oracledb://system:system@localhost:1521/XE")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # JWT settings
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "jwt_secret_key")
    JWT_ACCESS_TOKEN_EXPIRES = 3600  # Token expires in 1 hour

    # Email settings
    MAIL_SERVER = os.getenv("MAIL_SERVER", "smtp.example.com")
    MAIL_PORT = int(os.getenv("MAIL_PORT", 587))
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.getenv("MAIL_USERNAME", "your-email@example.com")
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD", "your-email-password")

    # Redis settings (for caching & Celery tasks)
    REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

    # CORS settings: the allowed origins for the frontend.
    # This will be split if multiple origins are provided.
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:8080").split(',')

class DevelopmentConfig(Config):
    """Configuration for Development Environment"""
    DEBUG = True

class ProductionConfig(Config):
    """Configuration for Production Environment"""
    DEBUG = False

class TestingConfig(Config):
    """Configuration for Unit Testing"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
