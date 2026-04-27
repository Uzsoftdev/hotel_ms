"""
Prometheus metrics middleware (R12 — Observability).

Exposes /metrics endpoint scraped by Prometheus.
Grafana dashboards visualise these; Loki collects structured logs via Docker log driver.

Metrics exposed:
  - http_requests_total{method, endpoint, status}   — counter
  - http_request_duration_seconds{method, endpoint}  — histogram (latency)
  - active_websocket_connections                     — gauge
  - cache_hits_total / cache_misses_total            — counters (updated by cache.py)
"""

import time

from fastapi import Request, Response
from prometheus_client import (
    CONTENT_TYPE_LATEST,
    Counter,
    Gauge,
    Histogram,
    generate_latest,
)
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.routing import Match

# ── Metric definitions ────────────────────────────────────────────────────────

REQUEST_COUNT = Counter(
    "http_requests_total",
    "Total HTTP requests",
    ["method", "endpoint", "status"],
)

REQUEST_LATENCY = Histogram(
    "http_request_duration_seconds",
    "HTTP request latency",
    ["method", "endpoint"],
    buckets=[0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0],
)

ACTIVE_WS_CONNECTIONS = Gauge(
    "active_websocket_connections",
    "Number of open WebSocket connections",
)

CACHE_HITS = Counter("cache_hits_total", "Redis cache hits", ["cache_type"])
CACHE_MISSES = Counter("cache_misses_total", "Redis cache misses", ["cache_type"])


# ── Middleware ────────────────────────────────────────────────────────────────

class PrometheusMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        # Resolve the route template (e.g. /api/v1/user/bookings/{id})
        endpoint = self._resolve_path(request)
        method = request.method

        start = time.perf_counter()
        response = await call_next(request)
        duration = time.perf_counter() - start

        REQUEST_COUNT.labels(method=method, endpoint=endpoint, status=response.status_code).inc()
        REQUEST_LATENCY.labels(method=method, endpoint=endpoint).observe(duration)

        return response

    @staticmethod
    def _resolve_path(request: Request) -> str:
        for route in request.app.routes:
            match, _ = route.matches(request.scope)
            if match == Match.FULL:
                return route.path  # type: ignore[attr-defined]
        return request.url.path


# ── /metrics endpoint ─────────────────────────────────────────────────────────

async def metrics_endpoint(request: Request) -> Response:
    return Response(
        content=generate_latest(),
        media_type=CONTENT_TYPE_LATEST,
    )
