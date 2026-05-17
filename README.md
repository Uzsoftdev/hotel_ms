# allStay Hotel Management System

A full-stack distributed hotel management platform built for the **Database Application and Design** course (Spring 2026). The system covers guest bookings, staff operations, admin management, dynamic pricing, real-time WebSocket notifications, a Celery batch pipeline, and a full observability stack.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, i18next (8 languages) |
| Backend | FastAPI, SQLAlchemy 2.0, Alembic, Pydantic v2 |
| Relational DB | PostgreSQL 15 (primary + streaming replica via pg_basebackup) |
| Connection Pooler | PgBouncer (transaction mode, up to 1 000 client connections) |
| Cache / Broker | Redis 7 (availability cache + Celery broker + token-bucket store) |
| Full-text Search | Meilisearch v1.7 (polyglot persistence — R5) |
| Object Storage | MinIO (S3-compatible — avatars and hotel images) |
| Task Queue | Celery 5 + Celery Beat (batch pipeline — R10) |
| API Gateway | Traefik v3.1 (TLS termination, load balancing — R8) |
| Static / SPA | Nginx 1.25 (serves React build behind Traefik) |
| Observability | Prometheus + Grafana + Loki + Promtail + OpenTelemetry → Jaeger |
| Auth | JWT (access 30 min / refresh 7 days) + Google OAuth, RBAC |
| CI/CD | GitHub Actions → DigitalOcean (rsync + Alembic migrate + systemd restart) |

---

## Quick Start

### One command (Docker)

```bash
cp backend/.env.example backend/.env   # fill in secrets (see Environment Variables below)
docker compose up -d
```

The entire stack — PostgreSQL primary + replica, PgBouncer, Redis, backend ×2, Traefik, Nginx, MinIO, Meilisearch, Celery worker + beat, Flower, Jaeger, Prometheus, Grafana, Loki, Promtail, postgres_exporter, redis_exporter, pgAdmin — comes up with that single command.

| Service | Local URL |
|---|---|
| Frontend (React SPA) | http://localhost |
| API (FastAPI) | http://localhost/api/v1/ |
| Traefik dashboard | http://localhost:8080 |
| Grafana | http://localhost:3000 |
| Prometheus | http://localhost:9090 |
| Jaeger UI | http://localhost:16686 |
| Flower (Celery monitor) | http://localhost:5555 |
| MinIO console | http://localhost:9001 |
| pgAdmin | http://localhost:5050 |

### Without Docker (manual)

**Backend:**
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env                      # fill in secrets
alembic upgrade head                      # run migrations
python -m app.utils.seed_data            # seed demo data (optional)
uvicorn app.main:app --reload --port 8000
```

**Celery worker + beat (separate terminals):**
```bash
celery -A app.celery_app worker --loglevel=info --concurrency=4
celery -A app.celery_app beat   --loglevel=info
```

**Frontend:**
```bash
cd frontend/react-app
npm install
npm run dev                               # http://localhost:5173
```


---

## Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in the values.

### Application

| Variable | Required | Default | Description |
|---|---|---|---|
| `APP_NAME` | | `allStay Hotel API` | API title |
| `ENVIRONMENT` | | `production` | `development` or `production` |
| `DEBUG` | | `false` | Enable debug mode |

### Security

| Variable | Required | Description |
|---|---|---|
| `SECRET_KEY` | ✅ | JWT signing key — minimum 32 chars (`openssl rand -hex 32`) |
| `ALGORITHM` | | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | | `30` |
| `REFRESH_TOKEN_EXPIRE_DAYS` | | `7` |

### Database

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | Async PostgreSQL DSN — `postgresql+asyncpg://user:pass@host:5432/db` |
| `DATABASE_URL_SYNC` | | Sync DSN for Alembic (auto-derived from `DATABASE_URL` if blank) |
| `DATABASE_URL_PRIMARY` | | Write path via PgBouncer (falls back to `DATABASE_URL_SYNC`) |
| `DATABASE_URL_REPLICA` | | Read-replica path via PgBouncer (falls back to primary) |
| `POSTGRES_USER` | ✅ | Docker Compose: PostgreSQL superuser |
| `POSTGRES_PASSWORD` | ✅ | Docker Compose: PostgreSQL password |
| `POSTGRES_DB` | ✅ | Docker Compose: database name |
| `REPLICATION_PASSWORD` | ✅ | Streaming-replication user password (`openssl rand -hex 16`) |

### Redis

| Variable | Required | Description |
|---|---|---|
| `REDIS_URL` | ✅ | `redis://:password@host:6379/0` |
| `REDIS_PASSWORD` | ✅ | Docker Compose: Redis password |

### Full-text Search (Meilisearch)

| Variable | Required | Description |
|---|---|---|
| `MEILISEARCH_URL` | | `http://meilisearch:7700` |
| `MEILISEARCH_KEY` | ✅ | Meilisearch master key (`openssl rand -hex 16`) |

### Object Storage (MinIO)

| Variable | Required | Description |
|---|---|---|
| `MINIO_ENDPOINT` | | `http://minio:9000` |
| `MINIO_ACCESS_KEY` | ✅ | MinIO root user |
| `MINIO_SECRET_KEY` | ✅ | MinIO root password |
| `MINIO_BUCKET` | | `hotel-avatars` |
| `MINIO_PUBLIC_URL` | | Public-facing base URL for served files |

### Tracing

| Variable | Required | Description |
|---|---|---|
| `JAEGER_ENDPOINT` | | `http://jaeger:4317` — tracing disabled if blank |

### Email (SMTP)

| Variable | Required | Description |
|---|---|---|
| `EMAILS_ENABLED` | | `false` — set `true` to send real emails |
| `SMTP_HOST` | | `smtp.gmail.com` |
| `SMTP_PORT` | | `587` |
| `SMTP_USER` | | SMTP username |
| `SMTP_PASSWORD` | | SMTP password / app-password |
| `EMAIL_FROM` | | Sender address |
| `EMAIL_FROM_NAME` | | `allStay` |

### Google OAuth

| Variable | Required | Description |
|---|---|---|
| `GOOGLE_CLIENT_ID` | | OAuth 2.0 client ID from Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | | OAuth 2.0 client secret |
| `GOOGLE_REDIRECT_URI` | | Must match the URI registered in Google Cloud Console |

### Infrastructure

| Variable | Required | Description |
|---|---|---|
| `DOMAIN` | | `localhost` in dev; your real domain in production (e.g. `allstay.rest`) |
| `ACME_EMAIL` | | Email for Let's Encrypt certificate notifications |
| `CF_API_TOKEN` | | Cloudflare API token — only needed for DNS-01 TLS challenge |
| `FRONTEND_URL` | | Base URL inserted into email verification / password reset links |
| `PGADMIN_EMAIL` | | pgAdmin login email |
| `PGADMIN_PASSWORD` | | pgAdmin login password |
| `GRAFANA_PASSWORD` | | Grafana admin password (default `admin`) |

---

## Project Structure

```
hotel_management_system/
├── backend/
│   ├── app/
│   │   ├── api/v1/
│   │   │   ├── admin/       # Hotels, rooms, room types, bookings, pricing,
│   │   │   │                #   blackout dates, users, reports
│   │   │   ├── public/      # Auth (register, login, Google OAuth, password reset)
│   │   │   │                #   and hotel/room search
│   │   │   ├── user/        # Bookings, profile, payments, reviews,
│   │   │   │                #   notifications, wishlist
│   │   │   └── ws.py        # WebSocket real-time notifications (R7)
│   │   ├── components/
│   │   │   └── token_bucket.py   # From-scratch token-bucket rate limiter (R11)
│   │   ├── core/            # Config (pydantic-settings), database, security, tracing
│   │   ├── exceptions/      # Custom exception classes + FastAPI exception handlers
│   │   ├── middleware/       # Auth session, RBAC, token-bucket middleware,
│   │   │                    #   Prometheus metrics, tenant isolation
│   │   ├── models/          # 20 SQLAlchemy ORM models
│   │   ├── repositories/    # DB query layer (one file per aggregate)
│   │   ├── schemas/         # Pydantic request / response schemas
│   │   ├── services/        # Business logic — auth, availability, cache,
│   │   │                    #   email, payment, pricing, search, storage, WebSocket
│   │   ├── tasks/           # Celery tasks (R10)
│   │   │   ├── batch_tasks.py      # nightly_revenue_snapshot, hourly_cache_warmup
│   │   │   ├── email_tasks.py      # Async transactional emails
│   │   │   ├── indexing_tasks.py   # Meilisearch re-index jobs
│   │   │   └── payment_tasks.py    # Async payment processing
│   │   ├── utils/           # Logger, validators, seed data helper
│   │   └── workers/
│   │       └── background_tasks.py  # APScheduler shim (no-op; jobs run via Celery Beat)
│   ├── migrations/          # Alembic migration scripts
│   ├── scripts/             # Meilisearch seed, MinIO migration helpers
│   ├── static/              # Legacy avatar directory (superseded by MinIO)
│   ├── tests/               # pytest integration tests
│   ├── celery_app.py        # Celery app + Beat schedule
│   ├── alembic.ini
│   └── requirements.txt
├── frontend/react-app/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── public/      # Home, Hotels, Rooms, Booking, BookingConfirmation,
│   │   │   │                #   RoomDetails, SearchResults, FAQ, About, Contact,
│   │   │   │                #   Login, Register, ForgotPassword
│   │   │   ├── user/        # Dashboard, MyBookings, BookingDetails, EditBooking,
│   │   │   │                #   ProfileManagement, PaymentHistory, Reviews,
│   │   │   │                #   Notifications, UserSettings, SavedRooms
│   │   │   ├── admin/       # Dashboard, bookings (AllBookings, CheckInOut),
│   │   │   │                #   rooms (RoomsList, RoomTypes, AddRoom),
│   │   │   │                #   pricing (DynamicPricing, BlackoutDates),
│   │   │   │                #   reports (Occupancy, Revenue, GuestAnalytics),
│   │   │   │                #   users (AllGuests, StaffAccounts, AddUser),
│   │   │   │                #   system (ActivityLogs, Settings)
│   │   │   └── staff/       # AssignedBookings, CheckInOut, RoomStatusBoard,
│   │   │                    #   TaskManagement, DailySummary, GuestRequests
│   │   ├── components/      # Reusable UI — Navbar, Footer, AIHelper concierge,
│   │   │                    #   DateRangePicker, RoomCard, RoomFilter, …
│   │   ├── contexts/        # AuthContext, ThemeContext, NotificationContext,
│   │   │                    #   SocketContext, WishlistContext
│   │   ├── services/        # Axios API clients (auth, bookings, rooms, admin, …)
│   │   ├── routes/          # PrivateRoute, PublicRoute, RoleBasedRoute
│   │   └── utils/           # i18n, dateUtils, formatters, rolePermissions
│   └── tailwind.config.js
├── docker/
│   ├── Dockerfile.backend
│   ├── Dockerfile.celery
│   ├── Dockerfile.frontend
│   ├── traefik.yml            # Traefik static config (R8)
│   ├── traefik-dynamic.yml    # Traefik middleware — circuit breaker, retry
│   ├── nginx-static.conf      # Nginx config for the React SPA
│   └── pgbouncer.ini
├── observability/
│   ├── prometheus.yml
│   ├── loki-config.yml
│   ├── promtail.yml
│   └── grafana/provisioning/  # Auto-provisioned Grafana datasources + dashboards
├── .github/workflows/
│   ├── deploy-backend.yml     # Push to main → rsync + migrate + systemd restart
│   └── deploy-frontend.yml    # Push to main → npm build + rsync → Nginx reload
├── scripts/
│   ├── seed_database.py
│   └── generate_invoices.py
├── docker-compose.yml
└── README.md
```

---

## System Architecture

```
                        ┌─────────────────────────┐
                        │       Browser / App      │
                        └────────────┬────────────┘
                                     │ HTTPS :443
                        ┌────────────▼────────────┐
                        │     Traefik v3.1         │  TLS termination (Let's Encrypt)
                        │   API gateway / LB       │  Circuit breaker + retry middleware
                        └──────┬──────────┬───────┘
                               │          │  round-robin (sticky WS sessions)
               ┌───────────────▼──┐  ┌───▼───────────────┐
               │  FastAPI backend │  │  FastAPI backend   │
               │   (replica 1)    │  │   (replica 2)      │
               └──────┬───────────┘  └────────────────────┘
                      │
          ┌───────────┼───────────────┬────────────────┐
          │           │               │                │
    ┌─────▼─────┐ ┌───▼────┐  ┌──────▼──────┐  ┌──────▼──────┐
    │ PgBouncer │ │ Redis  │  │ Meilisearch │  │    MinIO    │
    │ (pooler)  │ │ cache  │  │  (search)   │  │  (storage)  │
    └─────┬─────┘ └───┬────┘  └─────────────┘  └─────────────┘
          │           │
   ┌──────▼──┐   ┌────▼──────────┐
   │ Postgres│   │ Celery worker │← Celery Beat (scheduled jobs)
   │ primary │   │               │
   └────┬────┘   └───────────────┘
        │
   ┌────▼──────┐
   │ Postgres  │  streaming replication (pg_basebackup)
   │  replica  │
   └───────────┘

Nginx ←── Traefik (priority 1) — serves React SPA on /*
```

**Production deployment (DigitalOcean):**
- `hms-backend` (167.99.138.191) — Traefik + Gunicorn/Uvicorn ×2 + Celery
- `hms-db` (164.92.193.226) — PostgreSQL 15 primary (private network only)

---

## How Requirements Are Met (R1–R13)

| ID | Requirement | Implementation |
|---|---|---|
| R1 | Business scenario + use cases | Hotel booking platform — 5+ actor flows (guest, staff, admin, system batch, real-time WS) |
| R2 | ER diagram, architecture diagrams | Included in the design report |
| R3 | Relational DB + migrations + seed | PostgreSQL 15, Alembic (`alembic upgrade head`), `python -m app.utils.seed_data` |
| R4 | RESTful API + live docs | FastAPI — all endpoints under `/api/v1/` |
| R5 | Polyglot persistence | Redis (key-value availability cache) + Meilisearch (full-text room/hotel search) |
| R6 | Cache, indexing, optimisation | Redis availability cache (5-min TTL, ~30× latency reduction); PgBouncer connection pooling; PostgreSQL streaming read-replica; DB indexes on FK columns |
| R7 | Additional API style | WebSocket at `/api/v1/ws/{user_id}` — real-time booking status pushed to connected clients; Redis Pub/Sub fan-out across replicas |
| R8 | API gateway + load balancing | Traefik v3.1 routes traffic, terminates TLS via Let's Encrypt, load-balances across `backend1` and `backend2`; config in `docker/traefik.yml` |
| R9 | Docker Compose orchestration | Single `docker compose up -d`; all services have healthchecks; stateful services use named volumes |
| R10 | Batch pipeline + BPMN diagrams | Celery Beat: `nightly_revenue_snapshot` (02:00 UTC) + `hourly_cache_warmup` (every hour); BPMN diagrams in design report |
| R11 | From-scratch system component | Token-bucket rate limiter in `backend/app/components/token_bucket.py` — atomic Redis Lua script, no third-party rate-limit library |
| R12 | Observability | Prometheus metrics → Grafana; structured logs → Loki via Promtail; distributed traces → Jaeger via OpenTelemetry |
| R13 | Documentation | This README, `.env.example`, CHANGELOG below |

---

## RBAC Roles

| Role | Access |
|---|---|
| `guest` | Browse, book, pay, review, manage own profile and bookings |
| `staff` | Check-in/out, task management, room status board, guest requests |
| `hotel_admin` | Full admin panel — rooms, pricing, bookings, users, reports |
| `super_admin` | All of the above across all hotels |

JWT payload carries `{user_id, role, hotel_id}`. Middleware enforces role gates before every protected handler.

---

## Database Migrations

```bash
# Apply all pending migrations
cd backend
alembic upgrade head

# Create a new migration after model changes
alembic revision --autogenerate -m "describe your change"

# Roll back one step
alembic downgrade -1
```

---

## CI/CD

Push to `main` triggers automatic deployment via GitHub Actions.

| Workflow | Trigger | Steps |
|---|---|---|
| `deploy-backend.yml` | `backend/**` changed | rsync → `pip install` → `alembic upgrade head` → systemd restart |
| `deploy-frontend.yml` | `frontend/**` changed | `npm run build` → rsync `dist/` → `nginx -s reload` |

**Required GitHub Secrets:**

| Secret | Value |
|---|---|
| `DEPLOY_SSH_KEY` | Private SSH key for the production server |
| `DEPLOY_HOST` | Production server IP |
| `DEPLOY_USER` | SSH username |

**Required GitHub Variables:**

| Variable | Value |
|---|---|
| `VITE_API_URL` | Backend API base URL (e.g. `https://allstay.rest`) |

---

## Running Tests

```bash
cd backend
pytest tests/ -v
```

Tests use a dedicated test database and cover auth, bookings, rooms, admin endpoints, and pricing logic.

---

## Contributing

1. Branch off `main` — use descriptive branch names (`feat/`, `fix/`, `chore/`).
2. Make small, focused commits. Commit messages follow the pattern `type: short description`.
3. Run `alembic upgrade head` after pulling if model files changed.
4. Open a PR; tag a reviewer. The team leader merges.
5. Do not commit `.env`, `__pycache__/`, `node_modules/`, `dist/`, `*.log`, or compiled binaries — all are in `.gitignore`.

---

## CHANGELOG

### v1.2.0 — 2026-05-17
- Replaced APScheduler with Celery + Celery Beat (batch pipeline runs outside FastAPI process)
- Added Meilisearch for full-text hotel and room search (polyglot persistence)
- MinIO S3-compatible object storage for avatars and hotel images (multi-replica safe)
- PgBouncer connection pooler (transaction mode, 1 000 client connections)
- PostgreSQL streaming replication (hot-standby read replica via pg_basebackup)
- Traefik v3.1 replaces standalone Nginx as API gateway — TLS, load balancing, circuit breaker
- OpenTelemetry distributed tracing → Jaeger (traces FastAPI, SQLAlchemy, Redis)
- Google OAuth 2.0 direct integration (no third-party auth provider)
- AIHelper floating concierge chat component; opens via `ai-helper:open` custom event
- Filter `"nan"` descriptions from hotel listings (bad seed data guard)

### v1.1.0 — 2026-04-28
- GitHub Actions CI/CD (auto-deploy backend + frontend on push to main)
- Production infrastructure on DigitalOcean (2-droplet setup, private networking)
- Profile photo upload with avatar display across all views
- Dark/light theme toggle with full CSS variable support
- Language switcher fix (active state detection)
- Booking flow end-to-end fix (date widget → confirmation)
- Guest booking fix (`hotel_id` derived from room, not user)
- Registration error parsing fix (custom backend error format)

### v1.0.0 — 2026-04-15
- Full booking platform: search, book, pay, cancel
- JWT auth + RBAC (guest / staff / hotel_admin / super_admin)
- Dynamic pricing rules + blackout dates
- WebSocket real-time notifications
- Token-bucket rate limiter (Redis Lua — from scratch, R11)
- Celery Beat nightly revenue snapshot (02:00 UTC) + hourly cache warmup
- Prometheus + Grafana + Loki observability stack
- Alembic migrations + seed data
- Redis availability cache (~30× latency improvement on hot paths)
