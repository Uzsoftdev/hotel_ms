import logging
import sys
from typing import Any

from app.core.config import settings

_LOG_FORMAT = (
    "%(asctime)s | %(levelname)-8s | %(name)s:%(lineno)d | %(message)s"
    if settings.DEBUG
    else "%(asctime)s %(levelname)s %(name)s %(message)s"
)

logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format=_LOG_FORMAT,
    datefmt="%Y-%m-%dT%H:%M:%S",
    stream=sys.stdout,
)

# Silence noisy third-party loggers in production
if not settings.DEBUG:
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)


def log_request(method: str, path: str, status_code: int, duration_ms: float) -> None:
    logger = get_logger("http")
    logger.info(
        "method=%s path=%s status=%d duration_ms=%.1f",
        method,
        path,
        status_code,
        duration_ms,
    )


def log_exception(logger: logging.Logger, exc: Exception, context: Any = None) -> None:
    logger.exception(
        "Unhandled exception: %s | context=%s",
        type(exc).__name__,
        context,
        exc_info=exc,
    )
