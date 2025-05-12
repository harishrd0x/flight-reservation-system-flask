# backend/config/config.py
# Central place to define configs for different environments (development, production, etc.)

import os

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "super-secret")

    # TODO: Add DB config, caching, email config, etc.

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False

def get_config_class(env):
    if env == "production":
        return ProductionConfig
    return DevelopmentConfig