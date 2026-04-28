from celery import Celery
from celery.schedules import crontab

from app.core.config import settings

celery_app = Celery(
    "hotel_tasks",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=[
        "app.tasks.email_tasks",
        "app.tasks.payment_tasks",
        "app.tasks.batch_tasks",
        "app.tasks.indexing_tasks",
    ],
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
    task_acks_late=True,            # re-queue if worker crashes mid-task
    worker_prefetch_multiplier=1,   # fair dispatch — important for long-running tasks
    result_expires=3600,
)

celery_app.conf.beat_schedule = {
    "nightly-revenue-snapshot": {
        "task": "app.tasks.batch_tasks.nightly_revenue_snapshot",
        "schedule": crontab(hour=2, minute=0),
    },
    "hourly-cache-warmup": {
        "task": "app.tasks.batch_tasks.hourly_cache_warmup",
        "schedule": crontab(minute=0),
    },
}
