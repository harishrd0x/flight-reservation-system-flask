import os

class BaseConfig:
    SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-key")
    DEBUG = False
    TESTING = False
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "jwt-secret")
    MAIL_SERVER = os.getenv("MAIL_SERVER", "smtp.gmail.com")
    MAIL_PORT = int(os.getenv("MAIL_PORT", 587))
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.getenv("MAIL_USERNAME")
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
    CACHE_TYPE = "SimpleCache"
    CACHE_DEFAULT_TIMEOUT = 300

class DevelopmentConfig(BaseConfig):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///dev.db")

class ProductionConfig(BaseConfig):
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")

class TestingConfig(BaseConfig):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = os.getenv("TEST_DATABASE_URL", "sqlite:///test.db")

def get_config_class(config_name: str = None):
    """
    Returns the appropriate config class.
    Priority: Explicit argument > CONFIG_MODE environment variable > development.
    """
    config_name = config_name or os.getenv("CONFIG_MODE", "development").lower()

    if config_name == "production":
        return ProductionConfig
    elif config_name == "testing":
        return TestingConfig
    elif config_name == "development":
        return DevelopmentConfig

    raise ValueError(f"Unknown configuration name: '{config_name}'")
