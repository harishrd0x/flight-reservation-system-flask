# backend/utils/logging_config.py
# Sets up logging to both file and console, rotating logs to avoid unlimited file growth

import logging
from logging.handlers import RotatingFileHandler
import os

def init_logging(app):
    log_dir = os.path.join(os.getcwd(), 'logs')
    os.makedirs(log_dir, exist_ok=True)
    log_file = os.path.join(log_dir, 'app.log')

    formatter = logging.Formatter(
        '%(asctime)s - %(levelname)s - %(name)s - %(message)s'
    )

    file_handler = RotatingFileHandler(log_file, maxBytes=10240, backupCount=5)
    file_handler.setFormatter(formatter)
    file_handler.setLevel(logging.INFO)  # TODO: Set to DEBUG if needed

    stream_handler = logging.StreamHandler()
    stream_handler.setFormatter(formatter)
    stream_handler.setLevel(logging.INFO)

    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    root_logger.addHandler(file_handler)
    root_logger.addHandler(stream_handler)

    app.logger = root_logger

    # TODO: Add email alerts for critical errors (in production only)


'''
# backend/utils/logging_config.py

import logging
from logging.handlers import RotatingFileHandler
import os

def init_logging(app):
    log_dir = os.path.join(os.getcwd(), 'logs')
    os.makedirs(log_dir, exist_ok=True)
    log_file = os.path.join(log_dir, 'app.log')

    formatter = logging.Formatter(
        '%(asctime)s - %(levelname)s - %(name)s - %(message)s'
    )

    file_handler = RotatingFileHandler(log_file, maxBytes=10240, backupCount=5)
    file_handler.setFormatter(formatter)
    file_handler.setLevel(logging.INFO)  # Adjust to DEBUG if needed

    # Optional: Stream handler for console output during dev
    stream_handler = logging.StreamHandler()
    stream_handler.setFormatter(formatter)
    stream_handler.setLevel(logging.INFO)

    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    root_logger.addHandler(file_handler)
    root_logger.addHandler(stream_handler)

    app.logger = root_logger  # Link Flask's logger to this one

    # TODO: Add email alerts for critical errors (in production only)

'''