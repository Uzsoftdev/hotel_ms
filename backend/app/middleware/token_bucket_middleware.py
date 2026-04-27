"""FastAPI middleware that uses our from-scratch TokenBucketLimiter."""

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

from app.components.token_bucket import TokenBucketLimiter
from app.services.cache import get_redis


def _get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


class TokenBucketMiddleware(BaseHTTPMiddleware):
    """Replaces SlowAPI with our from-scratch Redis token-bucket limiter."""

    def __init__(self, app, **kwargs):
        super().__init__(app, **kwargs)
        self._limiter: TokenBucketLimiter | None = None

    def _get_limiter(self) -> TokenBucketLimiter:
        if self._limiter is None:
            self._limiter = TokenBucketLimiter(get_redis())
        return self._limiter

    async def dispatch(self, request: Request, call_next) -> Response:
        # Skip metrics + health endpoints
        if request.url.path in ("/metrics", "/health", "/docs", "/redoc", "/openapi.json"):
            return await call_next(request)

        ip = _get_client_ip(request)
        limiter = self._get_limiter()

        if not limiter.is_allowed(ip, request.url.path):
            remaining = limiter.get_remaining(ip, request.url.path)
            return JSONResponse(
                status_code=429,
                content={"detail": "Too many requests. Please slow down."},
                headers={"X-RateLimit-Remaining": str(remaining), "Retry-After": "60"},
            )

        response = await call_next(request)
        return response
