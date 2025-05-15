import logging
from logging.handlers import RotatingFileHandler
import os

def setup_logging(log_file_path=None):
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)  # Default log level, adjust as needed

    formatter = logging.Formatter(
        "%(asctime)s [%(levelname)s] %(name)s - %(message)s"
    )

    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

    # File handler (optional)
    if log_file_path:
        os.makedirs(os.path.dirname(log_file_path), exist_ok=True)
        file_handler = RotatingFileHandler(log_file_path, maxBytes=10 * 1024 * 1024, backupCount=5)
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)

    logger.info("Logging is configured.")
