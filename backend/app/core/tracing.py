"""
OpenTelemetry tracing via OTLP gRPC → Jaeger (Phase 3).

Instruments FastAPI, SQLAlchemy, and Redis automatically.
Call setup_tracing(app) in main.py before any middleware is added.
Tracing is a no-op when JAEGER_ENDPOINT is blank (local dev without Jaeger).
"""
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)


def setup_tracing(app) -> None:
    if not settings.JAEGER_ENDPOINT:
        logger.info("Jaeger endpoint not set — tracing disabled")
        return

    try:
        from opentelemetry import trace
        from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
        from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
        from opentelemetry.instrumentation.redis import RedisInstrumentor
        from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor
        from opentelemetry.sdk.resources import Resource
        from opentelemetry.sdk.trace import TracerProvider
        from opentelemetry.sdk.trace.export import BatchSpanProcessor

        resource = Resource.create({"service.name": "hotel-api", "service.version": settings.APP_VERSION})
        provider = TracerProvider(resource=resource)
        exporter = OTLPSpanExporter(endpoint=settings.JAEGER_ENDPOINT, insecure=True)
        provider.add_span_processor(BatchSpanProcessor(exporter))
        trace.set_tracer_provider(provider)

        FastAPIInstrumentor.instrument_app(app)
        SQLAlchemyInstrumentor().instrument()
        RedisInstrumentor().instrument()

        logger.info("OpenTelemetry tracing enabled → %s", settings.JAEGER_ENDPOINT)
    except ImportError:
        logger.warning("opentelemetry packages not installed — tracing disabled")
