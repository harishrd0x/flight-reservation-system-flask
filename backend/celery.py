from flask import Flask
from celery import Celery

# Celery initialization
celery = Celery()

def init_celery(app):
    """Initialize Celery with the app's configuration."""
    celery.conf.update(app.config)
    return celery


    # TODO: Autodiscover and register tasks here
    # e.g., from tasks import email_tasks

