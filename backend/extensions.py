from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from flask_mail import Mail
from flask_caching import Cache
from celery import Celery

# Initialize Flask extensions globally
db = SQLAlchemy()       # Database ORM
jwt = JWTManager()      # JWT Authentication
migrate = Migrate()     # Database Migrations
mail = Mail()           # Email Service
cache = Cache(config={"CACHE_TYPE": "redis", "CACHE_REDIS_URL": "redis://localhost:6379/0"})  # Redis-based caching
celery = Celery(__name__, broker="redis://localhost:6379/0")  # Celery Task Queue (Redis as broker)

def init_extensions(app):
    """Initialize all extensions with the Flask app instance."""
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    mail.init_app(app)
    cache.init_app(app)
    celery.conf.update(app.config)
