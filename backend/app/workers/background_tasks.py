"""
Background task stubs (APScheduler disabled — R10 batch pipeline runs via Celery Beat).

The actual nightly_revenue_snapshot and hourly_cache_warmup tasks live in:
  app/tasks/batch_tasks.py

They are scheduled by Celery Beat via celery_app.conf.beat_schedule (app/celery_app.py)
and run inside the Celery worker process, NOT inside the FastAPI process.

start_scheduler() and stop_scheduler() are kept as no-ops so main.py lifespan
does not need changes if APScheduler is re-enabled in future.
"""

import logging

logger = logging.getLogger(__name__)


def start_scheduler() -> None:
    """APScheduler is disabled — batch jobs are handled by Celery Beat."""
    logger.info("APScheduler disabled — batch jobs run via Celery Beat (app/tasks/batch_tasks.py)")


def stop_scheduler() -> None:
    pass

