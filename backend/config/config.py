# backend/config/config.py
# Central place to define configs for different environments (development, production, etc.)

import os

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "supersecretkey")  # TODO: Set a secure key in production
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "jwtsecret")  # TODO: Set in .env for prod

    # TODO: Add DB config, caching, email config, etc.

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False

def get_config_class(env):
    if env == "production":
        return ProductionConfig
    return DevelopmentConfig