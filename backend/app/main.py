import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Public routes
from app.api.v1.public.auth import router as public_auth_router
from app.api.v1.public.search import router as public_search_router

# User routes
from app.api.v1.user.bookings import router as user_bookings_router
from app.api.v1.user.notifications import router as user_notifications_router
from app.api.v1.user.payments import router as user_payments_router
from app.api.v1.user.profile import router as user_profile_router
from app.api.v1.user.reviews import router as user_reviews_router
from app.api.v1.user.wishlist import router as user_wishlist_router

# Admin routes
from app.api.v1.admin.blackout_dates import router as admin_blackout_router
from app.api.v1.admin.bookings import router as admin_bookings_router
from app.api.v1.admin.hotels import router as admin_hotels_router
from app.api.v1.admin.pricing import router as admin_pricing_router
from app.api.v1.admin.reports import router as admin_reports_router
from app.api.v1.admin.room_types import router as admin_room_types_router
from app.api.v1.admin.rooms import router as admin_rooms_router
from app.api.v1.admin.users import router as admin_users_router

# WebSocket (R7)
from app.api.v1.ws import router as ws_router

# Ensure all models are imported so SQLAlchemy can resolve relationships
import app.models.activity_log    # noqa: F401
import app.models.amenity         # noqa: F401
import app.models.blackout_date   # noqa: F401
import app.models.booking         # noqa: F401
import app.models.facility        # noqa: F401
import app.models.hotel           # noqa: F401
import app.models.hotel_facility  # noqa: F401
import app.models.hotel_image     # noqa: F401
import app.models.notification    # noqa: F401
import app.models.payment         # noqa: F401
import app.models.pricing_rule    # noqa: F401
import app.models.review          # noqa: F401
import app.models.room            # noqa: F401
import app.models.room_amenity    # noqa: F401
import app.models.room_image      # noqa: F401
import app.models.room_type       # noqa: F401
import app.models.user            # noqa: F401
import app.models.wishlist        # noqa: F401
import app.models.email_verification  # noqa: F401
import app.models.password_reset      # noqa: F401

from app.core.config import settings
from app.core.tracing import setup_tracing
from app.exceptions.handlers import register_exception_handlers
from app.middleware.auth import DBSessionMiddleware
from app.middleware.token_bucket_middleware import TokenBucketMiddleware
from app.middleware.observability import PrometheusMiddleware, metrics_endpoint
from app.workers.background_tasks import start_scheduler, stop_scheduler


@asynccontextmanager
async def lifespan(app: FastAPI):
    from app.services.websocket import ws_manager
    await ws_manager.start_subscriber()   # Redis Pub/Sub cross-replica WS broadcast
    start_scheduler()
    yield
    stop_scheduler()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="allStay Hotel Management API — full-stack distributed system",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── Tracing (must happen before middleware so spans cover all requests) ───────
setup_tracing(app)

# ── Middleware (outermost first) ──────────────────────────────────────────────
app.add_middleware(PrometheusMiddleware)
app.add_middleware(TokenBucketMiddleware)   # R11 — from-scratch token bucket
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
)
app.add_middleware(DBSessionMiddleware)

# ── Exception handlers ────────────────────────────────────────────────────────
register_exception_handlers(app)

# ── Observability endpoint (R12) ──────────────────────────────────────────────
app.add_route("/metrics", metrics_endpoint)

# ── WebSocket (R7) ────────────────────────────────────────────────────────────
app.include_router(ws_router)

# ── Public ────────────────────────────────────────────────────────────────────
app.include_router(public_auth_router,         prefix="/api/v1/public")
app.include_router(public_search_router,       prefix="/api/v1/public")

# ── User ──────────────────────────────────────────────────────────────────────
app.include_router(user_bookings_router,       prefix="/api/v1/user")
app.include_router(user_profile_router,        prefix="/api/v1/user")
app.include_router(user_reviews_router,        prefix="/api/v1/user")
app.include_router(user_notifications_router,  prefix="/api/v1/user")
app.include_router(user_payments_router,       prefix="/api/v1/user")
app.include_router(user_wishlist_router,       prefix="/api/v1/user")

# ── Admin ─────────────────────────────────────────────────────────────────────
app.include_router(admin_hotels_router,        prefix="/api/v1/admin")
app.include_router(admin_rooms_router,         prefix="/api/v1/admin")
app.include_router(admin_room_types_router,    prefix="/api/v1/admin")
app.include_router(admin_bookings_router,      prefix="/api/v1/admin")
app.include_router(admin_pricing_router,       prefix="/api/v1/admin")
app.include_router(admin_blackout_router,      prefix="/api/v1/admin")
app.include_router(admin_users_router,         prefix="/api/v1/admin")
app.include_router(admin_reports_router,       prefix="/api/v1/admin")


app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/health", tags=["Health"])
def health_check() -> dict:
    from app.services.websocket import ws_manager
    return {
        "status": "ok",
        "version": settings.APP_VERSION,
        "ws_connections": ws_manager.connected_users,
    }


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=settings.DEBUG)
