"""
System health endpoint — GET /api/v1/admin/system/health
"""
import time
import logging
from datetime import datetime, timezone, timedelta
from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy.sql import text

from app.dependencies import get_read_db
from app.middleware.rbac import require_staff_or_admin
from app.models.activity_log import ActivityLog
from app.models.user import User

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/system", tags=["Admin System"])


@router.get("/health")
def system_health(
    db: Session = Depends(get_read_db),
    _: User = Depends(require_staff_or_admin),
) -> Any:
    checks = []
    overall_ok = True

    # ── Database check ────────────────────────────────────────────────────────
    db_status = "ok"
    db_latency = None
    db_detail = None
    try:
        t0 = time.time() * 1000
        db.execute(text("SELECT 1"))
        db_latency = round(time.time() * 1000 - t0, 2)
    except Exception as exc:
        db_status = "error"
        db_detail = str(exc)
        overall_ok = False
        logger.warning("DB health check failed: %s", exc)
    checks.append({"name": "database", "status": db_status, "latency_ms": db_latency, "detail": db_detail})

    # ── Redis check ───────────────────────────────────────────────────────────
    redis_status = "ok"
    redis_latency = None
    redis_detail = None
    try:
        from app.services.cache import get_redis
        t0 = time.time() * 1000
        get_redis().ping()
        redis_latency = round(time.time() * 1000 - t0, 2)
    except Exception as exc:
        redis_status = "error"
        redis_detail = str(exc)
        overall_ok = False
        logger.warning("Redis health check failed: %s", exc)
    checks.append({"name": "redis", "status": redis_status, "latency_ms": redis_latency, "detail": redis_detail})

    # ── Celery check ──────────────────────────────────────────────────────────
    celery_status = "ok"
    celery_detail = None
    try:
        from app.celery_app import celery_app
        result = celery_app.control.inspect(timeout=1.0).ping()
        if not result:
            celery_status = "unknown"
    except Exception as exc:
        celery_status = "unknown"
        celery_detail = str(exc)
        logger.warning("Celery health check failed: %s", exc)
    checks.append({"name": "celery", "status": celery_status, "latency_ms": None, "detail": celery_detail})

    # ── Activity log stats ────────────────────────────────────────────────────
    cutoff_24h = datetime.now(timezone.utc) - timedelta(hours=24)
    try:
        recent_errors = (
            db.query(ActivityLog)
            .filter(
                ActivityLog.created_at >= cutoff_24h,
                ActivityLog.action.ilike("%error%") | ActivityLog.action.ilike("%fail%"),  # type: ignore[arg-type]
            )
            .count()
        )
    except Exception:
        recent_errors = 0

    try:
        total_logs = db.query(ActivityLog).count()
    except Exception:
        total_logs = 0

    overall_status = "healthy" if overall_ok else "degraded"

    return {
        "status": overall_status,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "checks": checks,
        "stats": {
            "recent_errors_24h": recent_errors,
            "total_activity_logs": total_logs,
        },
    }
