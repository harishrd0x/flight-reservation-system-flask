from celery import Celery
from flask import Flask

celery = Celery(__name__)


def create_celery_app(app: Flask = None) -> Celery:
    app = app or create_app()
    celery.conf.update(app.config)

    class ContextTask(celery.Task):
        def __call__(self, *args, **kwargs):
            with app.app_context():
                return self.run(*args, **kwargs)

    celery.Task = ContextTask

    # TODO: Autodiscover and register tasks here
    # e.g., from backend.tasks import email_tasks

    return celery
