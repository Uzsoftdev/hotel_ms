# allStay Hotel Management System — Complete System Design

> **Production domain:** https://allstay.rest  
> **Stack:** FastAPI · PostgreSQL · Redis · React · Vite · Tailwind CSS · Docker Swarm · Traefik · Celery · Meilisearch · MinIO · Prometheus · Grafana · Loki · Jaeger  

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [High-Level Architecture](#2-high-level-architecture)
3. [Frontend](#3-frontend)
4. [Backend API](#4-backend-api)
5. [Database Design](#5-database-design)
6. [Authentication & Security](#6-authentication--security)
7. [Caching — Redis](#7-caching--redis)
8. [Task Queue — Celery](#8-task-queue--celery)
9. [Full-Text Search — Meilisearch](#9-full-text-search--meilisearch)
10. [Object Storage — MinIO](#10-object-storage--minio)
11. [Real-Time — WebSocket](#11-real-time--websocket)
12. [Infrastructure & Containerisation](#12-infrastructure--containerisation)
13. [Reverse Proxy — Traefik](#13-reverse-proxy--traefik)
14. [CI/CD — GitHub Actions](#14-cicd--github-actions)
15. [Observability](#15-observability)
16. [Role-Based Access Control (RBAC)](#16-role-based-access-control-rbac)
17. [Internationalisation (i18n)](#17-internationalisation-i18n)
18. [Environment Configuration](#18-environment-configuration)
19. [Local Development Setup](#19-local-development-setup)
20. [Directory Structure](#20-directory-structure)

---

## 1. Project Overview

allStay is a full-stack hotel management and booking platform. It allows:

- **Guests** to search hotels, browse rooms, make bookings, write reviews, save wishlists, and pay online.
- **Hotel Admins** to manage their hotel's rooms, pricing, blackout dates, and view occupancy / revenue reports.
- **Staff** to handle daily check-in/check-out, room status, guest requests, and task assignments.
- **Super Admins** to manage all hotels, all users, and platform-wide settings.

The system is designed for production readiness from day one: multi-replica API servers, connection pooling, async task processing, full observability, and automated deployments via GitHub Actions.

---

## 2. High-Level Architecture

```
                        ┌─────────────────────────────────────────────┐
                        │            Cloudflare CDN / DNS              │
                        │         (allstay.rest — DDoS, cache)         │
                        └──────────────────┬──────────────────────────┘
                                           │ HTTPS 443
                        ┌──────────────────▼──────────────────────────┐
                        │             Traefik v3.1                      │
                        │  (reverse proxy, TLS termination, routing,    │
                        │   circuit-breaker, retry, www-redirect)       │
                        └──────┬────────────────────┬──────────────────┘
                               │                    │
               ┌───────────────▼──────┐   ┌────────▼───────────────┐
               │   nginx_static        │   │  backend1 / backend2    │
               │  (React SPA dist/)    │   │  (FastAPI + Gunicorn    │
               │                       │   │   4 workers each)       │
               └───────────────────────┘   └────────┬───────────────┘
                                                     │
              ┌──────────────────────────────────────▼──────────────────────────────────┐
              │                           Shared Services                                │
              │                                                                          │
              │  ┌──────────────┐  ┌──────────────┐  ┌───────────┐  ┌───────────────┐  │
              │  │  PostgreSQL   │  │   PgBouncer   │  │   Redis   │  │  Meilisearch  │  │
              │  │  primary +    │  │  (connection  │  │  (cache,  │  │  (full-text   │  │
              │  │  replica1     │  │   pooling)    │  │  queue,   │  │   search)     │  │
              │  └──────────────┘  └──────────────┘  │  pub/sub) │  └───────────────┘  │
              │                                        └───────────┘                     │
              │  ┌──────────────┐  ┌──────────────┐  ┌───────────┐  ┌───────────────┐  │
              │  │ Celery Worker│  │  Celery Beat  │  │   MinIO   │  │    Jaeger     │  │
              │  │ (async tasks)│  │  (scheduler)  │  │  (S3 obj  │  │  (tracing)    │  │
              │  └──────────────┘  └──────────────┘  │  storage) │  └───────────────┘  │
              │                                        └───────────┘                     │
              │  ┌──────────────┐  ┌──────────────┐  ┌───────────┐                      │
              │  │  Prometheus  │  │   Grafana     │  │   Loki    │                      │
              │  │  (metrics)   │  │  (dashboards) │  │  (logs)   │                      │
              │  └──────────────┘  └──────────────┘  └───────────┘                      │
              └──────────────────────────────────────────────────────────────────────────┘
```

**Why this architecture?**
- Two backend replicas provide horizontal scaling and zero-downtime deploys.
- PgBouncer prevents connection exhaustion under load (PostgreSQL has a hard limit on connections).
- The replica database handles heavy read queries (reports, search) without impacting writes on the primary.
- Redis serves three purposes — caching, Celery message broker, and WebSocket Pub/Sub — keeping the infrastructure lean.
- Traefik auto-discovers services from Docker labels and manages TLS, removing the need to hand-edit Nginx configs.

---

## 3. Frontend

### Technology Choices

| Tool | Version | Why |
|---|---|---|
| React | 18.3 | Industry standard SPA framework with concurrent features |
| Vite | 7.3 | Near-instant HMR, native ESM, significantly faster than CRA |
| React Router | 6.28 | Declarative client-side routing with nested layouts |
| Tailwind CSS | 3.4 | Utility-first — fast iteration, no naming CSS classes |
| Axios | 1.15 | Better interceptor support than fetch for auth token injection |
| i18next | 26.0 | Multi-language support with JSON namespace files |

### Project Structure

```
frontend/react-app/src/
├── pages/
│   ├── public/          # Home, Hotels, RoomDetails, Booking, Login, Register, About, Contact
│   ├── user/            # Dashboard, MyBookings, ProfileManagement, Wishlist, Reviews
│   ├── admin/           # Dashboard, Hotels, Rooms, Pricing, Reports, Users, Content, System
│   ├── staff/           # AssignedBookings, CheckInOut, RoomStatusBoard, TaskManagement
│   └── auth/            # AuthCallback (Google OAuth)
├── components/
│   ├── common/          # Navbar, Modal, Toast, Pagination, DateRangePicker, GuestsPicker
│   ├── public/          # BookingSearchBar, RoomCard, RoomFilter, AIHelper, AvailabilityCalendar
│   ├── admin/           # DataTable, ChartWidget, KPICard, ImageUploader, ExportButton
│   ├── staff/           # TaskCard, RoomGrid, StatusToggle
│   └── user/            # BookingCard, ReviewForm, NotificationItem
├── contexts/
│   ├── AuthContext.jsx       # Global auth state, token refresh, loginUser/logoutUser
│   ├── WishlistContext.jsx   # Saved rooms (localStorage-backed)
│   ├── ThemeContext.jsx      # Dark / light mode toggle
│   ├── NotificationContext.jsx  # Toast dispatch
│   └── SocketContext.jsx    # WebSocket lifecycle management
├── services/
│   ├── api.js           # Axios instance — baseURL, auth interceptor, 401 redirect
│   ├── auth.js          # login, register, verify-email, forgot/reset password
│   ├── bookings.js      # Booking CRUD
│   ├── rooms.js / hotels.js  # Catalog endpoints
│   └── admin.js / staff.js  # Role-specific API calls
├── routes/
│   ├── PrivateRoute.jsx     # Redirects unauthenticated users to /login
│   ├── RoleBasedRoute.jsx   # Redirects wrong-role users
│   └── PublicRoute.jsx      # Redirects logged-in users away from /login
├── locales/             # i18n JSON (en, de, es, fr, it, ja, pt, ru, zh, ar)
├── utils/               # formatters, validators, rolePermissions, dateUtils
└── hooks/               # useFetch, useAuth, useWebSocket, useRoleAccess
```

### API Client (`api.js`)

```js
const api = axios.create({
  baseURL: `${VITE_API_URL || (DEV ? '' : 'https://allstay.rest')}/api/v1`,
  timeout: 15000,
});
```

- **Development:** `baseURL = /api/v1` — Vite dev proxy forwards `/api/*` to `https://allstay.rest`, so the frontend never hits CORS restrictions during local development.
- **Production:** `baseURL = https://allstay.rest/api/v1` — direct same-origin requests (no CORS).

The response interceptor strips tokens and redirects to `/login` on 401 only on protected routes (`/admin`, `/user/`, `/staff/`) — public pages remain accessible even if a stale token triggers a 401.

### Routing & Role Guards

Three route wrapper components enforce access:

```
/                   → Public (anyone)
/hotels             → Public (anyone)
/login /register    → PublicRoute (redirect away if already logged in)
/user/*             → PrivateRoute (guest role)
/admin/*            → RoleBasedRoute (hotel_admin or super_admin)
/staff/*            → RoleBasedRoute (staff role)
```

### Vite Dev Proxy

```js
// vite.config.js
proxy: {
  '/api': {
    target: 'https://allstay.rest',
    changeOrigin: true,
    secure: true,
  },
},
```

The proxy routes all `/api/*` requests from the local dev server to the production backend at `allstay.rest`. This means you can develop the frontend against the live database without running the backend locally.

---

## 4. Backend API

### Technology Choices

| Tool | Version | Why |
|---|---|---|
| FastAPI | 0.115.6 | Async-native, automatic OpenAPI docs, Pydantic validation |
| Uvicorn | 0.32.1 | ASGI server, handles async endpoints and WebSockets |
| Gunicorn | 22.0.0 | Multi-worker process manager (4 workers per replica) |
| SQLAlchemy | 2.0.36 | Modern ORM with 2.0 query syntax, good connection management |
| Alembic | 1.14.0 | Schema migration management tied to SQLAlchemy models |
| Pydantic | 2.10.4 | Runtime data validation for all request/response bodies |
| python-jose | 3.3.0 | JWT creation and verification |
| passlib + bcrypt | 1.7.4 / 4.2.1 | Password hashing (bcrypt is intentionally slow — brute-force resistance) |

### API Structure

All routes are versioned under `/api/v1/` and split into three access tiers:

```
/api/v1/public/     → No auth required (search, auth, register)
/api/v1/user/       → Requires valid JWT (guest+ role)
/api/v1/admin/      → Requires hotel_admin or super_admin role
/api/v1/ws          → WebSocket endpoint (optional auth)
```

#### Public Routes (`/api/v1/public/`)

| Method | Path | Description |
|---|---|---|
| POST | `/auth/register` | Create guest account, trigger email verification |
| POST | `/auth/login` | Email + password → access + refresh tokens |
| POST | `/auth/google` | Google OAuth code exchange → app JWT |
| POST | `/auth/logout` | Blacklist current token in Redis |
| POST | `/auth/refresh` | Rotate refresh token → new token pair |
| POST | `/auth/verify-email` | Consume email verification token |
| POST | `/auth/resend-verification` | Re-send verification email |
| POST | `/auth/forgot-password` | Send password reset email |
| POST | `/auth/reset-password` | Consume reset token, update password |
| GET  | `/search/hotels/browse` | Paginated hotel list (no auth) |
| GET  | `/search/rooms` | Rooms for a hotel by `hotel_id` |

#### User Routes (`/api/v1/user/`)

| Method | Path | Description |
|---|---|---|
| GET/POST | `/bookings` | List own bookings / create new booking |
| GET/PATCH/DELETE | `/bookings/{id}` | Booking detail / modify / cancel |
| GET/PATCH | `/profile` | View / update own profile |
| GET | `/payments` | Payment history |
| GET/POST | `/reviews` | Own reviews / submit review |
| GET/POST/DELETE | `/wishlist` | Saved rooms list / add / remove |
| GET/PATCH | `/notifications` | Notifications / mark read |

#### Admin Routes (`/api/v1/admin/`)

| Method | Path | Description |
|---|---|---|
| GET/POST/PATCH/DELETE | `/hotels` | Full hotel CRUD |
| GET/POST/PATCH/DELETE | `/rooms` | Room inventory CRUD |
| GET/POST/PATCH/DELETE | `/room-types` | Room type definitions |
| GET/POST/PATCH/DELETE | `/bookings` | All bookings + check-in/out |
| GET/POST/PATCH/DELETE | `/pricing` | Dynamic pricing rules |
| GET/POST/PATCH/DELETE | `/blackout-dates` | Block availability periods |
| GET/POST/PATCH/DELETE | `/users` | User and staff management |
| GET | `/reports/revenue` | Revenue by date range / hotel |
| GET | `/reports/occupancy` | Occupancy rate by period |
| GET | `/reports/guests` | Guest demographics and behaviour |

### Middleware Stack (applied in order)

```
Request → CORSMiddleware
        → RateLimitMiddleware  (token bucket per IP)
        → ObservabilityMiddleware  (Prometheus counters, latency histogram)
        → DBSessionMiddleware  (SQLAlchemy session per request)
        → TenantMiddleware     (hotel_id isolation for hotel_admin)
        → RBACMiddleware       (role enforcement per route)
        → Route Handler
        → Response
```

**Why token-bucket rate limiting?**  
Unlike fixed-window counters, a token bucket allows short bursts (e.g., a user rapidly clicking "Search") while smoothing sustained abuse. Each IP gets 60 tokens/minute; burst capacity is 20.

### Pydantic Schemas (DTOs)

Every request body and response is typed with a Pydantic model. This provides:
- Automatic `422 Unprocessable Entity` with field-level error messages for bad input.
- OpenAPI schema generation (accessible at `/docs` and `/redoc`).
- Runtime type coercion (e.g., string `"2026-05-14"` → `datetime.date`).

### Gunicorn + Uvicorn Worker Model

```
Gunicorn (process manager)
├── UvicornWorker 1 (async event loop)
├── UvicornWorker 2
├── UvicornWorker 3
└── UvicornWorker 4
```

Each worker handles many concurrent connections via Python's `asyncio`. `--max-requests 1000` and `--max-requests-jitter 100` restart workers after handling ~1000 requests, preventing memory leaks from slowly growing objects.

---

## 5. Database Design

### Technology: PostgreSQL 15

**Why PostgreSQL over MySQL or MongoDB?**
- ACID transactions are critical for booking operations (two guests must not book the same room for the same dates).
- JSON columns are available when needed without sacrificing relational integrity.
- Streaming replication is built-in, enabling a hot-standby read replica.
- Row-level locking prevents double-bookings under concurrent writes.

### Schema (Core Tables)

```
users
├── id (PK)
├── email (unique)
├── hashed_password
├── full_name
├── role  [guest | staff | hotel_admin | super_admin]
├── hotel_id (FK → hotels, nullable — set for staff/admin)
├── photo_url
├── is_email_verified
└── created_at

hotels
├── id (PK)
├── name, description, address, city, country
├── latitude, longitude
├── rating (0–5)
└── created_at

room_types
├── id (PK)
├── hotel_id (FK → hotels)
├── name (e.g. "Deluxe Suite")
├── base_price
├── capacity
└── description

rooms
├── id (PK)
├── hotel_id (FK → hotels)
├── room_type_id (FK → room_types)
├── room_number
├── is_active
└── status  [available | occupied | maintenance | cleaning]

bookings
├── id (PK)
├── user_id (FK → users)
├── room_id (FK → rooms)
├── hotel_id (FK → hotels)
├── check_in_date, check_out_date
├── guest_adults, guest_children
├── total_price
├── status  [pending | confirmed | checked_in | checked_out | cancelled | no_show]
├── cancellation_reason
└── created_at

payments
├── id (PK)
├── booking_id (FK → bookings)
├── user_id (FK → users)
├── amount, currency
├── status  [pending | completed | failed | refunded]
├── processor_reference
└── paid_at

reviews
├── id (PK)
├── booking_id (FK → bookings)
├── user_id (FK → users)
├── hotel_id (FK → hotels)
├── rating (1–5)
├── comment
└── created_at

pricing_rules
├── id (PK)
├── hotel_id (FK → hotels)
├── room_type_id (FK → room_types, nullable)
├── start_date, end_date
├── price_modifier (multiplier, e.g. 1.5 = 50% surcharge)
└── reason (e.g. "Holiday season")

blackout_dates
├── id (PK)
├── hotel_id (FK → hotels)
├── start_date, end_date
└── reason

wishlist
├── id (PK)
├── user_id (FK → users)
└── room_id (FK → rooms)

notifications
├── id (PK)
├── user_id (FK → users)
├── title, message
├── type  [booking | payment | system | review]
├── is_read
└── created_at

email_verifications
├── token (unique)
├── user_id (FK → users)
├── expires_at
└── used_at

password_resets
├── token (unique)
├── user_id (FK → users)
├── expires_at
└── used_at

hotel_images / room_images
├── id (PK)
├── hotel_id / room_id (FK)
├── image_url
└── is_primary
```

### PostgreSQL Streaming Replication

```
Primary (db)
  WAL level = replica
  max_wal_senders = 5
  wal_keep_size = 256 MB
      │
      │  pg_basebackup (one-time + ongoing WAL stream)
      │  replication slot: replica1_slot
      ▼
Replica (db_replica1)
  hot_standby = on  (read-only queries allowed)
```

**Why replication?**
- Heavy report queries (occupancy, revenue aggregations) can run on the replica without impacting booking write latency on the primary.
- Provides a warm failover database — if the primary fails, the replica can be promoted quickly.

### PgBouncer Connection Pooling

```
FastAPI workers (8 per replica × 2 replicas = 16 potential DB connections)
      │
      ▼
PgBouncer (transaction mode, max_client_conn = 1000, default_pool_size = 25)
      │
      ▼
PostgreSQL (accepts ~25 real connections from the pool)
```

**Why PgBouncer?**
- PostgreSQL forks a new process for every connection. Maintaining 100 open connections from Gunicorn workers is expensive.
- PgBouncer multiplexes many application connections over a small number of actual DB connections.
- Transaction mode is chosen because each FastAPI request uses a DB connection only during the request lifetime — sessions are short-lived.

### Alembic Migrations

All schema changes are versioned with Alembic and applied automatically on deploy:

```bash
alembic upgrade head    # Apply all pending migrations
alembic downgrade -1    # Roll back one version
alembic revision --autogenerate -m "add_column_x"  # Generate from model diff
```

Migration files are in `backend/migrations/versions/` and follow the naming convention `YYYYMMDD_NNNN_description.py`.

---

## 6. Authentication & Security

### JWT Token Flow

```
Login → POST /auth/login
          │
          ▼
     Verify password (bcrypt)
          │
          ▼
     Issue access_token (30 min) + refresh_token (7 days)
          │
     Both contain: { user_id, role, hotel_id, jti, exp }
          │
     Client stores both in localStorage
          │
     Every API request → Authorization: Bearer <access_token>
          │
     On 401 → use refresh_token → POST /auth/refresh → new token pair
          │
     On logout → POST /auth/logout → jti added to Redis blacklist
```

**Why JWTs?**
- Stateless — the server doesn't need to query the database for every request.
- The payload carries `role` and `hotel_id` so RBAC and tenant isolation work without extra DB lookups.
- Short expiry (30 min) limits damage from token theft.
- The refresh token allows seamless token rotation without requiring re-login every 30 minutes.

### Token Blacklist (Redis)

When a user logs out, the JWT's `jti` (unique token ID) is stored in Redis with a TTL equal to the token's remaining lifetime. The `get_current_user` dependency checks Redis before trusting the token.

This closes the gap where a valid JWT would otherwise remain usable until expiry even after logout.

### Google OAuth (Direct Flow)

```
Browser → Google OAuth consent screen
              │  authorization code
              ▼
AuthCallback.jsx → POST /api/v1/public/auth/google
                       { code, redirect_uri }
              │
              ▼
         Backend exchanges code with Google OAuth2 API
         GET https://www.googleapis.com/oauth2/v3/userinfo
              │
              ▼
         Find or create user in DB (role = guest, is_email_verified = true)
              │
              ▼
         Return app JWT (same format as email/password login)
```

**Why direct Google OAuth instead of Supabase?**
The consent screen shows `allstay.rest` as the app name instead of `supabase.co`, giving users confidence they are signing into allStay.

### Password Security

- Passwords are hashed with bcrypt (cost factor 12) — bcrypt intentionally slows down hashing to resist brute-force attacks.
- Password reset tokens are `secrets.token_urlsafe(32)` — 256 bits of entropy.
- Reset tokens expire after 30 minutes and are single-use (marked with `used_at` timestamp).
- Email verification tokens expire after 24 hours.

### CORS

```python
ALLOWED_ORIGINS = [
    "http://localhost:5173", ..., "http://localhost:5180",  # dev ports
    "https://allstay.rest",
    "https://www.allstay.rest",
]
```

The backend only accepts cross-origin requests from known origins. The wildcard (`*`) is never used in production.

---

## 7. Caching — Redis

**Image:** `redis:7-alpine`  
**Persistence:** AOF (Append-Only File) — every write operation is logged to disk, so the cache survives container restarts.  
**Auth:** Password-protected (`--requirepass`).

### Usage Patterns

| Key Pattern | Purpose | TTL |
|---|---|---|
| `blacklist:{jti}` | Revoked JWT token | Token's remaining lifetime |
| `availability:{room_id}:{date}` | Room availability for a date | 15 minutes |
| `hotel_search:{query_hash}` | Cached hotel search results | 5 minutes |
| `rate_limit:{ip}` | Token bucket for rate limiting | 1 minute |

### Why Redis for Celery?

Redis acts as both the Celery **broker** (task inbox) and **backend** (result store). When `send_verification_email_task.delay(...)` is called, a JSON message is pushed to a Redis list. The Celery worker pops it and processes it asynchronously. The calling request returns immediately without waiting for the email to send.

### Why Redis for WebSocket Pub/Sub?

With two backend replicas (backend1, backend2), a WebSocket client connected to backend1 won't receive messages published by backend2. Redis Pub/Sub solves this: when any replica publishes an event (e.g., "booking confirmed"), both replicas receive it and forward it to their connected WebSocket clients.

---

## 8. Task Queue — Celery

**Broker & Backend:** Redis  
**Worker concurrency:** 8 (8 tasks can execute simultaneously per worker container)  
**Beat scheduler:** 1 replica only — running two Beat instances would fire every scheduled job twice.

### Why Celery?

Long-running or I/O-heavy operations (sending emails, processing payments, updating search indexes, generating reports) would block an API request if run inline. Celery moves them to a background queue, keeping API response times under 100ms.

### Scheduled Tasks (Beat)

| Schedule | Task | What it does |
|---|---|---|
| Every hour | `warmup_availability_cache` | Pre-populate Redis with availability for the next 30 days |
| Every night (00:05) | `create_revenue_snapshot` | Aggregate yesterday's revenue into a summary table |
| On demand | `update_meilisearch_index` | Sync hotel/room changes to the search engine |

### Email Task Example

```python
# API handler — returns immediately
send_verification_email_task.delay(
    to=user.email,
    full_name=user.full_name,
    token=token,
)

# Celery worker — executes asynchronously
@celery_app.task
def send_verification_email_task(to, full_name, token):
    send_email(to, "Verify your email", render_template(...))
```

### Flower (Task Monitor)

Flower is a web UI for Celery, available at port 5555. It shows:
- Active tasks and their arguments
- Task history and failure rates
- Worker status and concurrency
- Queue depths

---

## 9. Full-Text Search — Meilisearch

**Image:** `getmeili/meilisearch:v1.7.3`  
**Why Meilisearch over PostgreSQL full-text?**
- Typo-tolerance out of the box — searching "Hottel Ylberi" still finds "Hotel Ylberi".
- Ranking by relevance, not just presence.
- Faceted filtering (filter by city, price range, rating simultaneously).
- Sub-50ms response times for 100k+ records.
- Simple HTTP API with minimal configuration.

### Indexed Data

Hotels are indexed with:
- `name`, `description`, `city`, `country`
- `rating`, `price_range` (for facet filtering)

The `indexing_tasks.py` Celery task keeps the search index in sync with the PostgreSQL database whenever a hotel or room is created, updated, or deleted.

### Browse Endpoint

The `/public/search/hotels/browse` endpoint returns paginated hotel results directly from PostgreSQL (sorted by rating) — no Meilisearch query needed when the user hasn't typed a search term. This is faster for the default "show all hotels" page.

The Meilisearch integration is used when the user types into the search bar to get ranked, typo-tolerant results.

---

## 10. Object Storage — MinIO

**Image:** `minio/minio:RELEASE.2024-06-13T22-53-53Z`  
**API Port:** 9000 (S3-compatible)  
**Console Port:** 9001

**Why MinIO instead of local disk?**
With two backend replicas running on the same server, a file uploaded to backend1's local disk is not visible to backend2. MinIO is a shared S3-compatible object store that both replicas access via the same endpoint. It also works identically to AWS S3, so migrating to S3 in the future requires only changing the endpoint URL and credentials.

### Buckets

| Bucket | Contents |
|---|---|
| `hotel-avatars` | User profile photos |
| `hotel-images` | Hotel and room photos |

Uploaded files are stored in MinIO and the resulting public URL is saved in the database (`users.photo_url`, `hotel_images.image_url`).

The Traefik router exposes MinIO at `https://allstay.rest/storage/*` with a `stripPrefix` middleware, so uploaded images are accessible as public URLs.

---

## 11. Real-Time — WebSocket

### Architecture

```
Browser  ──── ws://allstay.rest/ws ────▶  Traefik (sticky session)
                                               │
                                    ┌──────────▼──────────┐
                                    │                     │
                               backend1             backend2
                                    │                     │
                                    └──────────┬──────────┘
                                               │ Redis Pub/Sub
                                          hotel_channel
```

### Why Sticky Sessions?

WebSocket connections are long-lived (HTTP connections that were upgraded). Without sticky sessions, Traefik could route a reconnect to a different backend replica, losing the in-memory connection state. The `SERVERID` cookie ensures a client always reconnects to the same replica.

### Redis Pub/Sub for Cross-Replica Broadcast

When a booking is confirmed on backend2, it publishes to the Redis channel `hotel_channel`. Both backend1 and backend2 subscribe to this channel and forward the event to their respective connected WebSocket clients. This ensures all clients receive the event regardless of which replica they are connected to.

### Events Sent to Clients

| Event | Trigger |
|---|---|
| `booking_confirmed` | Admin confirms a pending booking |
| `booking_cancelled` | Booking is cancelled |
| `new_notification` | Any notification created for the user |
| `room_status_changed` | Staff updates room status |
| `checkin_reminder` | 24h before check-in |

---

## 12. Infrastructure & Containerisation

### Docker Compose (Local Development)

`docker-compose.yml` defines all 23 services as a single-command local stack:

```bash
docker compose up -d   # Start everything
docker compose down    # Stop everything
docker compose logs -f backend1  # Follow backend logs
```

All services communicate on the `hotel_network` bridge network. Port mappings expose only what's needed for local development.

### Docker Stack (Production — Swarm)

`docker-stack.yml` is the production equivalent, used with Docker Swarm:

```bash
docker stack deploy -c docker-stack.yml hotel
```

Swarm provides:
- Rolling updates (new containers start before old ones stop)
- Automatic container restart on crash
- Declarative desired-state management

### Dockerfiles

#### `docker/Dockerfile.backend`
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ .
CMD ["gunicorn", "app.main:app",
     "--worker-class", "uvicorn.workers.UvicornWorker",
     "--workers", "4",
     "--bind", "0.0.0.0:8000",
     "--max-requests", "1000",
     "--max-requests-jitter", "100",
     "--timeout", "120"]
```

**Why `python:3.11-slim`?** The slim image is ~50MB vs 900MB for the full image. It excludes build tools that are unnecessary at runtime.

**Why `--max-requests 1000`?** Long-running Python processes can accumulate memory leaks from third-party libraries. Restarting workers after 1000 requests keeps memory usage flat.

#### `docker/Dockerfile.celery`
Same base as the backend. The `CMD` is overridden in `docker-compose.yml` per service:
- `celery_worker`: `celery -A app.celery_app worker --loglevel=info --concurrency=8`
- `celery_beat`: `celery -A app.celery_app beat --loglevel=info`
- `flower`: `celery -A app.celery_app flower --port=5555`

#### `docker/Dockerfile.frontend`
Builds the React app with Vite and serves `dist/` via nginx.

### Health Checks

Every critical service has a Docker health check:

```yaml
# Backend
test: python3 -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"
interval: 15s / timeout: 5s / retries: 3

# PostgreSQL
test: pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}

# Redis
test: redis-cli -a ${REDIS_PASSWORD} ping

# Meilisearch
test: curl -f http://localhost:7700/health
```

Services that `depends_on` a database wait until it passes its health check before starting. This prevents race conditions where the backend tries to connect to PostgreSQL before it's ready.

---

## 13. Reverse Proxy — Traefik

**Image:** `traefik:v3.1`

### Why Traefik instead of Nginx?

Nginx requires manual config file edits and reload every time a new service is added. Traefik reads Docker labels directly — adding a new service just requires adding labels to the container. It also handles Let's Encrypt certificate issuance and renewal automatically.

### Entry Points

| Port | Entry Point | Purpose |
|---|---|---|
| 80 | `web` | HTTP → HTTPS redirect (permanent 301) |
| 443 | `websecure` | HTTPS (TLS terminated here) |
| 8080 | `dashboard` | Traefik admin UI (firewalled in production) |

### Routing Rules

```
allstay.rest/api/*         → backend-svc (FastAPI)
allstay.rest/ws/*          → backend-svc (WebSocket)
allstay.rest/health        → backend-svc
allstay.rest/metrics       → backend-svc (Prometheus scrape)
allstay.rest/static/*      → backend-svc (uploaded files)
allstay.rest/storage/*     → minio-svc (object storage)
allstay.rest/*             → frontend-svc (React SPA, catch-all)
www.allstay.rest/*         → redirect to allstay.rest
```

Backend has priority 10 and frontend has priority 1 — higher priority routes are matched first, ensuring `/api/*` never falls through to the SPA.

### Middlewares

| Middleware | Purpose |
|---|---|
| `circuit-breaker` | Stop forwarding traffic if >30% network errors or >25% 5xx responses |
| `retry` | Retry failed requests up to 3 times (100ms initial interval) |
| `www-redirect` | Redirect `www.allstay.rest` → `allstay.rest` (canonical URL) |
| `minio-strip` | Strip `/storage` prefix before forwarding to MinIO |

### TLS Certificate Management

Two resolvers are configured:

1. **`letsencrypt` (HTTP-01):** Default. Let's Encrypt sends an HTTP request to `http://allstay.rest/.well-known/acme-challenge/...` to prove domain ownership. Used when Cloudflare proxy is **disabled**.

2. **`letsencrypt-dns` (DNS-01):** Used when the domain is proxied through Cloudflare (HTTP-01 fails because Cloudflare's IP is seen, not the server's). Uses the Cloudflare API (`CF_API_TOKEN`) to create a TXT DNS record for verification.

Certificates are stored in the `traefik_certs` Docker volume and auto-renewed 30 days before expiry.

### Sticky Sessions

```yaml
traefik.http.services.backend.loadbalancer.sticky.cookie.name=SERVERID
traefik.http.services.backend.loadbalancer.sticky.cookie.secure=true
traefik.http.services.backend.loadbalancer.sticky.cookie.httponly=true
```

The `SERVERID` cookie ensures a user always hits the same backend replica. This is critical for WebSocket connections, which are long-lived and must not be mid-connection transferred to a different server.

---

## 14. CI/CD — GitHub Actions

### Workflows

#### `deploy-backend.yml` — Triggered on push to `main` when `backend/**` or `docker/**` changes

```
Step 1: Build & push Docker images to GHCR
  ├── backend image → ghcr.io/{owner}/hotel-backend:latest + :{sha}
  └── celery image  → ghcr.io/{owner}/hotel-celery:latest + :{sha}
  └── (Layer cache via GitHub Actions Cache for fast rebuilds)

Step 2: Deploy to production server
  ├── SSH into DigitalOcean server
  ├── rsync docker-stack.yml + docker/ to /opt/hotel/
  ├── Inject GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET into /opt/hotel/.env
  └── Run /opt/hotel/docker/deploy.sh (rolling Swarm update)
```

**Why GHCR (GitHub Container Registry)?**
- Free for public repos and included with GitHub Pro.
- Integrated with GitHub Actions — no separate registry credentials needed (uses `GITHUB_TOKEN`).
- Images are tagged with both `:latest` and `:{git-sha}` so previous versions can be pulled for rollback.

#### `deploy-frontend.yml` — Triggered on push to `main` when `frontend/**` changes

```
Step 1: Node.js 20, npm ci (uses lockfile for reproducible installs)
Step 2: vite build (injects VITE_API_URL, VITE_GOOGLE_CLIENT_ID)
Step 3: rsync dist/ → /opt/hms/frontend/ on production server
Step 4: docker restart hotel_nginx_static (picks up new files)
```

**Why rsync instead of building a new Docker image?**
The React build output is just static files. rsync'ing them directly to the server is faster than building, pushing, and pulling a new container image for a static file change.

#### Other Workflows

| Workflow | Trigger | Purpose |
|---|---|---|
| `certbot.yml` | Monthly cron | SSL certificate renewal |
| `reset-admin.yml` | Manual (`workflow_dispatch`) | Reset super_admin password |
| `reset-credentials.yml` | Manual | Rotate server credentials |
| `get-logs.yml` | Manual | Pull logs from production for debugging |
| `migrate-images.yml` | Manual | Batch migrate hotel images to MinIO |

### GitHub Secrets

The following secrets must be set in `Settings → Secrets → Actions`:

| Secret | Description |
|---|---|
| `DEPLOY_SSH_KEY` | Private SSH key for server access |
| `DEPLOY_HOST` | Production server IP or hostname |
| `DEPLOY_USER` | SSH username |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `VITE_SUPABASE_URL` | Supabase URL (backup auth) |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key |

---

## 15. Observability

The full observability stack follows the three pillars: **Metrics** (Prometheus + Grafana), **Logs** (Loki + Promtail), and **Traces** (Jaeger).

### Prometheus — Metrics Collection

**Image:** `prom/prometheus:v2.51.0`  
**Config:** `observability/prometheus.yml`  
**Port:** 9090

**Why Prometheus?**
- Pull-based model — Prometheus scrapes metrics from services on a schedule. Services don't need to know Prometheus exists.
- Built-in service discovery via Docker labels.
- PromQL query language allows powerful aggregations (e.g., p99 latency, error rate over 5 min).
- Standard for the cloud-native ecosystem.

#### Scrape Targets

| Job | Target | Metrics |
|---|---|---|
| `allstay_backend` | backend1:8000, backend2:8000 (`/metrics`) | HTTP request rate, latency, WS connections |
| `postgres` | postgres_exporter:9187 | DB connections, cache hit ratio, query latency |
| `redis` | redis_exporter:9121 | Memory usage, commands/sec, keyspace hits |
| `promtail` | promtail:9080 | Log ingestion rate |

**Scrape interval:** 15 seconds

#### Custom Application Metrics (`prometheus_client`)

Exposed at `GET /metrics` by the backend:

```python
http_requests_total           # Counter: {method, endpoint, status_code}
http_request_duration_seconds # Histogram: {method, endpoint} — buckets from 5ms to 5s
active_websocket_connections  # Gauge: current connected WS clients
cache_hits_total              # Counter: Redis cache hits
cache_misses_total            # Counter: Redis cache misses
```

### Grafana — Dashboards

**Image:** `grafana/grafana:10.4.0`  
**Port:** 3000  
**Datasources:** Auto-provisioned from `observability/grafana/provisioning/datasources/datasources.yml`

| Dashboard | Description |
|---|---|
| `hotel-overview` | Main KPI view: request rate, latency p50/p95/p99, error rate, active users |
| `postgres-detail` | DB connections, transaction rate, slow queries, table bloat |
| `redis-detail` | Memory, eviction rate, hit ratio, command throughput |

Dashboards are auto-provisioned from JSON files in `observability/grafana/provisioning/dashboards/`. No manual import required after a fresh deploy.

**Why Grafana?**
- Connects to both Prometheus (metrics) and Loki (logs) — one UI for the full picture.
- Pre-built dashboard panels for PostgreSQL and Redis reduce setup time.
- Alerting can be configured directly in Grafana to send Slack or email notifications.

### Loki — Log Aggregation

**Image:** `grafana/loki:3.3.2`  
**Port:** 3100  
**Storage:** Filesystem (TSDB schema v13, chunks in `/loki/chunks`)

**Why Loki instead of Elasticsearch?**
- Loki indexes only labels (container name, service, log level) — not the full log text. This makes it 10x cheaper on storage and RAM than Elasticsearch.
- Designed for Docker/Kubernetes log shipping.
- Query language (LogQL) is similar to PromQL, so the same team can use both without context switching.
- Native Grafana datasource — logs appear in the same dashboards as metrics.

#### Loki Configuration Highlights

```yaml
limits_config:
  ingestion_rate_mb: 16        # Max 16 MB/s ingestion
  ingestion_burst_size_mb: 32  # Allow short bursts
  reject_old_samples: true     # Reject logs older than 168h (7 days)
  reject_old_samples_max_age: 168h
```

### Promtail — Log Shipping

**Image:** `grafana/promtail:3.3.2`

Promtail is a log agent that tails Docker container logs and ships them to Loki. It:
1. Reads logs from `/var/lib/docker/containers/*/` (Docker log files).
2. Attaches labels: `container`, `service`, `project`, `logstream` (stdout/stderr).
3. Filters to only ship logs from the `hotel_management_system` project.
4. Pushes to `http://loki:3100/loki/api/v1/push`.

**Why Promtail instead of Filebeat or Fluentd?**
Promtail is purpose-built for Loki and requires no plugins or transformations. It natively understands Docker log formats.

### Jaeger — Distributed Tracing

**Image:** `jaegertracing/all-in-one:1.57`  
**UI Port:** 16686  
**OTLP gRPC Port:** 4317

**Why distributed tracing?**
When a booking request flows through: Traefik → FastAPI → PostgreSQL → Redis → Celery → Email, traditional logs show events in isolation. A trace shows the entire request as a waterfall chart — exactly how long each step took, where the bottleneck is, and where an error occurred.

#### OpenTelemetry Integration

The backend uses the OpenTelemetry SDK to automatically instrument:

```python
opentelemetry-instrumentation-fastapi    # Trace every HTTP request
opentelemetry-instrumentation-sqlalchemy # Trace every DB query
opentelemetry-instrumentation-redis      # Trace every cache operation
```

Traces are exported to Jaeger via OTLP gRPC at `http://jaeger:4317`.

#### What a trace looks like

```
POST /api/v1/user/bookings  (120ms total)
├── check_availability_in_redis  (2ms)
├── SELECT * FROM rooms WHERE ...  (8ms)
├── INSERT INTO bookings ...  (15ms)
├── UPDATE room status ...  (12ms)
└── send_confirmation_email.delay()  (1ms — Celery enqueue)
    └── [async] smtp.send()  (800ms — in Celery worker, separate trace)
```

### postgres_exporter

**Image:** `prometheuscommunity/postgres-exporter:v0.15.0`

Connects to PostgreSQL and exposes 200+ metrics via HTTP, scraped by Prometheus:
- Active connections, idle connections, waiting connections
- Database size, table sizes, index usage
- Transaction commit/rollback rates
- Slow query detection (pg_stat_statements)
- Replication lag

### redis_exporter

**Image:** `oliver006/redis_exporter:v1.60.0`

Connects to Redis and exposes metrics scraped by Prometheus:
- Memory usage, peak memory
- Commands processed per second
- Keyspace hits and misses (cache hit ratio)
- Connected clients, blocked clients
- Persistence (AOF/RDB) status

---

## 16. Role-Based Access Control (RBAC)

### Roles

| Role | Description | Access Level |
|---|---|---|
| `guest` | Registered user / hotel customer | Own bookings, profile, wishlist, reviews |
| `staff` | Hotel employee | Assigned hotel check-in/out, room status, task management |
| `hotel_admin` | Hotel manager | Full control of their hotel's rooms, pricing, reports, staff |
| `super_admin` | Platform administrator | All hotels, all users, platform settings |

### Enforcement

RBAC is enforced at two levels:

**1. FastAPI dependency injection (per route):**

```python
async def require_admin(current_user = Depends(get_current_user)):
    if current_user.role not in ("hotel_admin", "super_admin"):
        raise HTTPException(403, "Insufficient permissions")
    return current_user
```

**2. Frontend route guards:**

```jsx
// Only hotel_admin and super_admin can access /admin/*
<RoleBasedRoute allowedRoles={["hotel_admin", "super_admin"]}>
  <AdminDashboard />
</RoleBasedRoute>
```

### Tenant Isolation

`hotel_admin` users are scoped to their own hotel via the `hotel_id` field in their JWT payload. The `TenantMiddleware` automatically appends `WHERE hotel_id = {current_user.hotel_id}` to all queries made by hotel_admin users, preventing them from accessing other hotels' data.

`super_admin` users bypass tenant isolation and can query across all hotels.

---

## 17. Internationalisation (i18n)

**Libraries:** `i18next` 26.0 + `react-i18next` 17.0

### Supported Languages

| Code | Language |
|---|---|
| `en` | English |
| `de` | German |
| `es` | Spanish |
| `fr` | French |
| `it` | Italian |
| `ja` | Japanese |
| `pt` | Portuguese |
| `ru` | Russian |
| `zh` | Chinese |
| `ar` | Arabic |

### Structure

Translation files are in `frontend/react-app/src/locales/{lang}/`. Each namespace (e.g., `pub_translation`, `admin_translation`) is a JSON file with nested keys:

```json
{
  "about": {
    "hero": {
      "title": "Our Story",
      "subtitle": "Crafting memorable experiences..."
    }
  }
}
```

Usage in components:
```jsx
const { t } = useTranslation("pub_translation");
<h1>{t("about.hero.title")}</h1>
```

The language switcher in the Navbar persists the user's choice to `localStorage`.

---

## 18. Environment Configuration

All secrets and configuration are in `.env` at the project root. Never commit this file.

### Required Variables

```bash
# ── App ──────────────────────────────────────────────────
APP_NAME="allStay Hotel API"
ENVIRONMENT=production          # development | production
DEBUG=false

# ── Security ─────────────────────────────────────────────
SECRET_KEY=<openssl rand -hex 32>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# ── Database ──────────────────────────────────────────────
DATABASE_URL=postgresql://hotel_user:PASSWORD@db:5432/hotel_system
POSTGRES_USER=hotel_user
POSTGRES_PASSWORD=<strong password>
POSTGRES_DB=hotel_system
REPLICATION_PASSWORD=<strong password>

# ── Redis ─────────────────────────────────────────────────
REDIS_URL=redis://:PASSWORD@redis:6379/0
REDIS_PASSWORD=<strong password>

# ── CORS ──────────────────────────────────────────────────
ALLOWED_ORIGINS=https://allstay.rest,https://www.allstay.rest

# ── Email (SMTP) ──────────────────────────────────────────
EMAILS_ENABLED=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASSWORD=<gmail app password>
EMAIL_FROM=your@gmail.com
EMAIL_FROM_NAME="allStay"

# ── Google OAuth ──────────────────────────────────────────
GOOGLE_CLIENT_ID=964778505369-...apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<from Google Cloud Console>

# ── MinIO Object Storage ──────────────────────────────────
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=<strong password>
MINIO_ENDPOINT=http://minio:9000
MINIO_BUCKET=hotel-avatars

# ── Search ────────────────────────────────────────────────
MEILISEARCH_KEY=<master key>

# ── Observability ─────────────────────────────────────────
JAEGER_ENDPOINT=http://jaeger:4317
GRAFANA_PASSWORD=<strong password>

# ── Traefik / TLS ─────────────────────────────────────────
DOMAIN=allstay.rest
ACME_EMAIL=your@email.com
CF_API_TOKEN=<cloudflare token — leave blank for HTTP-01>

# ── pgAdmin (dev only) ────────────────────────────────────
PGADMIN_EMAIL=admin@hotel.local
PGADMIN_PASSWORD=<password>
```

---

## 19. Local Development Setup

### Prerequisites

- Docker + Docker Compose
- Node.js 20+
- Git

### Steps

```bash
# 1. Clone
git clone https://github.com/your-org/hotel_management_system.git
cd hotel_management_system

# 2. Configure environment
cp .env.example .env
# Edit .env — fill in SECRET_KEY, POSTGRES_PASSWORD, REDIS_PASSWORD at minimum

# 3. Start all services
docker compose up -d

# 4. Run database migrations
docker exec hotel_backend1 alembic upgrade head

# 5. (Optional) Seed test data
docker exec hotel_backend1 python scripts/seed_database.py

# 6. Start frontend dev server
cd frontend/react-app
npm install
npm run dev   # http://localhost:5173
```

### Service URLs (Local)

| Service | URL | Credentials |
|---|---|---|
| Frontend (dev) | http://localhost:5173 | — |
| API Docs | http://localhost:80/docs | — |
| Grafana | http://localhost:3000 | admin / `$GRAFANA_PASSWORD` |
| Prometheus | http://localhost:9090 | — |
| Jaeger UI | http://localhost:16686 | — |
| pgAdmin | http://localhost:5050 | `$PGADMIN_EMAIL` / `$PGADMIN_PASSWORD` |
| MinIO Console | http://localhost:9001 | `$MINIO_ACCESS_KEY` / `$MINIO_SECRET_KEY` |
| Flower (Celery) | http://localhost:5555 | — |
| Traefik Dashboard | http://localhost:8080 | — |

---

## 20. Directory Structure

```
hotel_management_system/
├── .env                          # All secrets (never commit)
├── .env.example                  # Template for .env
├── docker-compose.yml            # Local dev — all 23 services
├── docker-stack.yml              # Production — Docker Swarm
├── SYSTEM_DESIGN.md              # This document
│
├── backend/
│   ├── requirements.txt
│   ├── app/
│   │   ├── main.py               # FastAPI app, route registration, lifespan
│   │   ├── celery_app.py         # Celery + Beat schedule
│   │   ├── dependencies.py       # get_db, get_current_user, oauth2_scheme
│   │   ├── core/
│   │   │   ├── config.py         # Settings (reads .env)
│   │   │   ├── database.py       # SQLAlchemy engine + session factory
│   │   │   ├── security.py       # JWT, bcrypt
│   │   │   └── tracing.py        # OpenTelemetry → Jaeger
│   │   ├── models/               # SQLAlchemy ORM models
│   │   ├── schemas/              # Pydantic request/response schemas
│   │   ├── services/             # Business logic (availability, pricing, search, email)
│   │   ├── repositories/         # Data access layer
│   │   ├── middleware/           # RBAC, rate limit, observability, tenant
│   │   ├── tasks/                # Celery tasks (email, payment, indexing, batch)
│   │   └── api/v1/
│   │       ├── public/           # auth.py, search.py
│   │       ├── user/             # bookings, profile, payments, reviews, wishlist
│   │       ├── admin/            # hotels, rooms, pricing, reports, users
│   │       └── ws.py             # WebSocket endpoint
│   └── migrations/
│       ├── alembic.ini
│       ├── env.py
│       └── versions/             # Migration files
│
├── frontend/react-app/
│   ├── package.json
│   ├── vite.config.js            # Dev proxy config
│   ├── .env                      # VITE_* variables (public)
│   ├── .env.production           # VITE_API_URL for prod build
│   └── src/
│       ├── main.jsx              # React entry point
│       ├── App.jsx               # Route tree
│       ├── pages/                # All page components (public/user/admin/staff/auth)
│       ├── components/           # Reusable UI components
│       ├── contexts/             # AuthContext, WishlistContext, ThemeContext, SocketContext
│       ├── services/             # api.js + per-domain API functions
│       ├── routes/               # PrivateRoute, RoleBasedRoute, PublicRoute
│       ├── hooks/                # Custom hooks
│       ├── utils/                # Formatters, validators, rolePermissions
│       └── locales/              # i18n JSON (10 languages)
│
├── docker/
│   ├── Dockerfile.backend
│   ├── Dockerfile.celery
│   ├── Dockerfile.frontend
│   ├── traefik.yml               # Traefik static config (entrypoints, ACME resolvers)
│   ├── traefik-dynamic.yml       # Traefik dynamic config (routers, middlewares, services)
│   ├── nginx-static.conf         # Nginx config for serving React dist/
│   ├── pgbouncer.ini             # PgBouncer connection pool config
│   ├── init-replication.sh       # Postgres replication user + slot setup
│   └── deploy.sh                 # Production Swarm deploy script
│
├── observability/
│   ├── prometheus.yml            # Scrape targets
│   ├── loki-config.yml           # Loki server + storage config
│   ├── promtail.yml              # Docker log shipping to Loki
│   └── grafana/
│       └── provisioning/
│           ├── datasources/      # Prometheus + Loki datasource definitions
│           └── dashboards/       # Auto-provisioned dashboard JSON files
│
├── nginx/
│   └── nginx.conf                # (Nginx replaced by Traefik in production)
│
├── scripts/
│   ├── seed_database.py          # Populate test data
│   ├── generate_invoices.py      # Batch invoice generation
│   └── backup_db.sh              # Database backup
│
└── .github/workflows/
    ├── deploy-backend.yml        # Build GHCR image + Swarm deploy
    ├── deploy-frontend.yml       # Vite build + rsync + nginx reload
    ├── certbot.yml               # Monthly SSL renewal
    ├── reset-admin.yml           # Manual: reset super_admin password
    ├── get-logs.yml              # Manual: pull production logs
    └── migrate-images.yml        # Manual: batch image migration to MinIO
```
