import time

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint

from app.core.database import SessionLocal
from app.utils.logger import log_request


class DBSessionMiddleware(BaseHTTPMiddleware):
    """Attach a SQLAlchemy session to request.state.db and close it after response."""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        start = time.monotonic()
        db = SessionLocal()
        request.state.db = db
        try:
            response = await call_next(request)
        except Exception:
            db.rollback()
            raise
        finally:
            db.close()

        duration_ms = (time.monotonic() - start) * 1000
        log_request(request.method, request.url.path, response.status_code, duration_ms)
        return response
