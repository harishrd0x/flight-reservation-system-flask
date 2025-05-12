# backend/extensions/extensions.py
# Central place to initialize extensions. Keeps your app factory clean.

# TODO: Import and initialize extensions like db, jwt, etc.

from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from flask_caching import Cache
from celery import Celery

# Initialize Flask extensions
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
mail = Mail()
cache = Cache()
celery = Celery()

def init_extensions(app):
    """
    Initialize all Flask extensions with the application.
    """
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    mail.init_app(app)
    cache.init_app(app)

    # Optional: Configure Celery later
    celery.conf.update(app.config.get('CELERY_CONFIG', {}))
    return celery


'''
# backend/extensions.py
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from flask_caching import Cache
from celery import Celery

# Initialize Flask extensions
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
mail = Mail()
cache = Cache()

# Celery instance will be configured in celery.py
celery = Celery()


def init_extensions(app):
    """
    Initialize all Flask extensions with the application.
    """
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    mail.init_app(app)
    cache.init_app(app)

    # Configure Celery after app context is available
    celery.conf.update(app.config.get('CELERY_CONFIG', {}))
    return celery
'''