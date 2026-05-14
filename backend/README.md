# ⚙️ Backend — allStay Hotel Management System

The backend is a **FastAPI** application running on **Python 3.11**, served in production by **Gunicorn + Uvicorn workers**. It provides a versioned REST API, real-time WebSocket notifications, async task processing via **Celery**, full-text search via **Meilisearch**, distributed tracing via **OpenTelemetry → Jaeger**, and Prometheus metrics.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [API Reference](#api-reference)
4. [Database & Migrations](#database--migrations)
5. [Authentication & Security](#authentication--security)
6. [Caching (Redis)](#caching-redis)
7. [Async Tasks (Celery)](#async-tasks-celery)
8. [Full-Text Search](#full-text-search-meilisearch)
9. [WebSockets](#websockets)
10. [Object Storage (MinIO)](#object-storage-minio)
11. [Environment Variables](#environment-variables)
12. [Local Development](#local-development)
13. [Running Tests](#running-tests)
14. [Database Migrations](#database-migrations) 

---

## Tech Stack

| Concern | Library | Version |
|---|---|---|
| Web framework | FastAPI | 0.115 |
| ASGI server | Uvicorn | 0.32 |
| Production server | Gunicorn | 22.0 |
| Data validation | Pydantic v2 | 2.10 |
| ORM | SQLAlchemy 2.0 | 2.0.36 |
| Migrations | Alembic | 1.14 |
| Database | PostgreSQL 15 | — |
| Connection pooler | PgBouncer | 1.22 |
| Cache / broker | Redis 7 | 5.2 (client) |
| Task queue | Celery | 5.4 |
| Task monitor | Flower | 2.0 |
| Full-text search | Meilisearch | 0.31 (client) |
| Object storage | MinIO (boto3) | 1.35 |
| Auth tokens | python-jose | 3.3 |
| Password hashing | passlib + bcrypt | 1.7 / 4.2 |
| Email | aiosmtplib | 3.0 |
| WebSockets | websockets | 13.1 |
| Metrics | prometheus-client | 0.21 |
| Tracing | OpenTelemetry SDK | 1.25 |

---

## Project Structure

```
backend/
├── .env.example             # Template — copy to project root as .env
├── alembic.ini              # Alembic migration configuration
├── pytest.ini               # Pytest configuration
├── requirements.txt         # Production dependencies
├── requirements-dev.txt     # Dev-only dependencies (pytest, etc.)
├── scripts/                 # One-off utility scripts (seed, data import…)
├── static/                  # Uploaded files served at /static/ (avatars, etc.)
├── migrations/              # Alembic revision files
│   ├── env.py
│   └── versions/
└── app/
    ├── main.py              # FastAPI app factory, middleware & router registration
    ├── auth.py              # JWT encode/decode helpers
    ├── celery_app.py        # Celery instance & Beat schedule
    ├── dependencies.py      # FastAPI DI (DB session, current user…)
    ├── api/v1/
    │   ├── public/          # Unauthenticated endpoints (auth, search)
    │   ├── user/            # Authenticated user endpoints
    │   ├── admin/           # Admin-only endpoints
    │   └── ws.py            # WebSocket endpoint
    ├── core/
    │   ├── config.py        # Pydantic Settings — reads from env
    │   ├── database.py      # SQLAlchemy engine & session factory
    │   ├── security.py      # Password hashing utilities
    │   └── tracing.py       # OpenTelemetry setup
    ├── models/              # SQLAlchemy ORM models
    ├── schemas/             # Pydantic request/response schemas
    ├── repositories/        # Data-access layer (all raw DB queries)
    ├── services/            # Business logic layer
    ├── tasks/               # Celery task definitions
    ├── workers/             # Background task starters (APScheduler compat)
    ├── middleware/
    │   ├── auth.py                    # DBSessionMiddleware
    │   ├── observability.py           # PrometheusMiddleware
    │   └── token_bucket_middleware.py # From-scratch rate limiter
    ├── exceptions/          # Custom exceptions + FastAPI handlers
    ├── templates/           # Jinja2 email HTML templates
    └── utils/               # Generic helper functions
```

---

## API Reference

Interactive docs are available after starting the server:

- **Swagger UI** → `http://localhost:8000/docs`
- **ReDoc** → `http://localhost:8000/redoc`

### Route Groups

#### Public — no auth required

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/v1/public/auth/register` | Register a new user |
| `POST` | `/api/v1/public/auth/login` | Login → returns JWT pair |
| `POST` | `/api/v1/public/auth/refresh` | Refresh access token |
| `POST` | `/api/v1/public/auth/logout` | Blacklist refresh token |
| `POST` | `/api/v1/public/auth/verify-email` | Verify email address |
| `POST` | `/api/v1/public/auth/forgot-password` | Send password reset email |
| `POST` | `/api/v1/public/auth/reset-password` | Reset password with token |
| `GET`  | `/api/v1/public/search/hotels` | Search and filter hotels |
| `GET`  | `/api/v1/public/search/hotels/:id` | Hotel detail |

#### User — JWT required

| Method | Path | Description |
|---|---|---|
| `GET/PATCH` | `/api/v1/user/profile` | Get / update own profile |
| `POST`      | `/api/v1/user/profile/avatar` | Upload avatar to MinIO |
| `GET/POST`  | `/api/v1/user/bookings` | List / create bookings |
| `GET/DELETE`| `/api/v1/user/bookings/:id` | Get / cancel booking |
| `GET/POST`  | `/api/v1/user/reviews` | List / create reviews |
| `GET/POST/DELETE` | `/api/v1/user/wishlist` | Manage saved hotels |
| `GET`       | `/api/v1/user/notifications` | List notifications |
| `GET/POST`  | `/api/v1/user/payments` | Payment history & initiation |

#### Admin — admin role required

| Method | Path | Description |
|---|---|---|
| `GET/POST` | `/api/v1/admin/hotels` | List / create hotels |
| `PUT/DELETE` | `/api/v1/admin/hotels/:id` | Update / delete hotel |
| `GET/POST` | `/api/v1/admin/rooms` | Room management |
| `GET/POST` | `/api/v1/admin/room-types` | Room type management |
| `GET/POST` | `/api/v1/admin/bookings` | Admin booking management |
| `GET/POST` | `/api/v1/admin/pricing` | Dynamic pricing rules |
| `GET/POST` | `/api/v1/admin/blackout-dates` | Unavailability periods |
| `GET`      | `/api/v1/admin/users` | User management |
| `GET`      | `/api/v1/admin/reports` | Revenue & occupancy reports |

#### Utility

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check + WS connection count |
| `GET` | `/metrics` | Prometheus scrape endpoint |
| `WS`  | `/ws/{user_id}` | Real-time notification stream |

---

## Database & Migrations

PostgreSQL 15 with streaming replication:

- **Primary** (`db`) — all writes routed here.
- **Replica** (`db_replica1`) — read-heavy queries (reports, listings).
- **PgBouncer** — connection pooler in transaction mode; max 1000 client connections, pool size 25.

### Data Models

| Model | Description |
|---|---|
| `User` | Users with roles: user / staff / admin |
| `Hotel` | Hotel property |
| `HotelImage` | S3/MinIO image references |
| `HotelFacility` | Hotel ↔ Facility many-to-many |
| `Room` | Individual room |
| `RoomType` | Room category (Single, Double, Suite…) |
| `RoomImage` | Room image references |
| `RoomAmenity` | Room ↔ Amenity many-to-many |
| `Booking` | Reservation record |
| `Payment` | Payment linked to booking |
| `Review` | Guest review |
| `Wishlist` | User-saved hotels |
| `Notification` | In-app notifications |
| `PricingRule` | Date-range dynamic pricing |
| `BlackoutDate` | Room unavailability |
| `ActivityLog` | Admin audit trail |
| `EmailVerification` | Email verification tokens |
| `PasswordReset` | Password reset tokens |

---

## Authentication & Security

- **JWT** access token (30 min) + refresh token (7 days) via `python-jose`.
- Passwords hashed with **bcrypt** (`passlib`).
- Refresh tokens stored and blacklisted in **Redis** on logout.
- **Rate limiting** implemented from scratch as `TokenBucketMiddleware` (no third-party library).
- CORS origins controlled by `ALLOWED_ORIGINS` env variable.

---

## Caching (Redis)

| Purpose | Key pattern | TTL |
|---|---|---|
| Refresh token store | `refresh:<user_id>` | 7 days |
| Token blacklist | `blacklist:<jti>` | Token expiry |
| API response cache | `cache:<route>:<hash>` | Per-route |
| Rate limiter state | `ratelimit:<ip>` | Rolling window |
| WebSocket pub/sub | `ws:channel` | Ephemeral |
| Celery task broker | — | — |

---

## Async Tasks (Celery)

Broker and result backend: **Redis**. Workers run with concurrency 8.

| Task | Trigger | Description |
|---|---|---|
| `send_verification_email` | On register | Email verification |
| `send_booking_confirmation` | On booking | Confirmation email |
| `send_password_reset` | On request | Password reset email |
| `sync_hotel_to_meilisearch` | On hotel change | Search index sync |
| `generate_report` | Celery Beat (nightly) | Occupancy reports |

> **Important:** Only one `celery_beat` replica must run. Running two Beat instances causes duplicate job execution.

Monitor tasks at **http://localhost:5555** (Flower).

---

## Full-Text Search (Meilisearch)

Hotels are indexed in Meilisearch for instant, typo-tolerant search.

- Index is created on startup if absent.
- Hotel records are upserted via a Celery task on every create/update.
- The `SearchService` provides query with filter, sort, and pagination support.

---

## WebSockets

Real-time notifications are pushed over WebSocket at `/ws/{user_id}`.

- `ws_manager` tracks per-user connections.
- Events are broadcast via **Redis Pub/Sub** so all backend replicas can deliver to any connected client.
- Traefik sticky sessions (cookie `SERVERID`) keep WebSocket clients on the same replica.

---

## Object Storage (MinIO)

- User avatars and hotel images stored in MinIO (S3-compatible).
- `StorageService` wraps `boto3` for presigned URL generation and upload.
- Bucket: `hotel-avatars` (configurable).
- In production, MinIO is proxied through Traefik at `/storage/`.

---

## Environment Variables

Copy `backend/.env.example` to the project root as `.env`.

| Variable | Description |
|---|---|
| `SECRET_KEY` | JWT signing key (`openssl rand -hex 32`) |
| `ALGORITHM` | JWT algorithm (default: `HS256`) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Access token lifetime |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Refresh token lifetime |
| `DATABASE_URL` | Primary PostgreSQL DSN |
| `DATABASE_URL_PRIMARY` | PgBouncer DSN for writes (Docker) |
| `DATABASE_URL_REPLICA` | Replica DSN for reads (Docker) |
| `REDIS_URL` | Redis DSN |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins |
| `EMAILS_ENABLED` | `true` to send real emails |
| `SMTP_HOST/PORT/USER/PASSWORD` | SMTP credentials |
| `MEILISEARCH_KEY` | Meilisearch master key |
| `MINIO_ACCESS_KEY` | MinIO access key |
| `MINIO_SECRET_KEY` | MinIO secret key |
| `MINIO_ENDPOINT` | MinIO internal endpoint |
| `MINIO_PUBLIC_URL` | Public-facing URL for stored files |
| `MINIO_BUCKET` | Storage bucket name |
| `JAEGER_ENDPOINT` | OTLP gRPC endpoint (`http://jaeger:4317`) |
| `ENVIRONMENT` | `development` or `production` |
| `DEBUG` | `true` enables Uvicorn reload |

---

## Local Development

### Prerequisites

- Python 3.11+
- PostgreSQL 15 (local or via Docker)
- Redis (local or via Docker)

### Steps

```bash
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Configure environment
cp .env.example ../.env
# Edit ../.env with local credentials

# Run migrations
alembic upgrade head

# Start dev server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs available at **http://localhost:8000/docs**.

---

## Running Tests

```bash
cd backend
source .venv/bin/activate

# All tests
pytest

# With coverage report
pytest --cov=app --cov-report=term-missing

# Specific file
pytest tests/test_bookings.py -v
```

---

## Database Migrations

```bash
# Generate new migration after changing models
alembic revision --autogenerate -m "describe_change"

# Apply all pending migrations
alembic upgrade head

# Roll back one revision
alembic downgrade -1

# Show current revision
alembic current
```

> Never edit an existing applied migration. Always create a new revision.
