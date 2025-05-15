# backend/extensions/__init__.py

from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from flask_caching import Cache
# from celery import Celery  # Optional

db = SQLAlchemy()
jwt = JWTManager()
mail = Mail()
cache = Cache()
from flask_cors import CORS
cors = CORS()
# celery = Celery()  # Optional

@jwt.user_identity_loader
def user_identity_lookup(user_id):
    return user_id

@jwt.additional_claims_loader
def add_custom_claims(identity):
    from models.user import User
    user = User.query.get(identity)
    return {
        "email": user.email,
        "role": user.role.value,
        "name": user.name
    }



def init_extensions(app):
    db.init_app(app)
    jwt.init_app(app)
    mail.init_app(app)
    cache.init_app(app)

    # Optional Celery setup
    # celery.conf.update(app.config.get('CELERY_CONFIG', {}))
    # return celery
