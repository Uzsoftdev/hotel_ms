# allStay Hotel Management System

Full-stack hotel management platform built with React, FastAPI, PostgreSQL, and Redis. Supports guest bookings, staff operations, admin management, real-time notifications, and dynamic pricing.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, i18next (8 languages) |
| Backend | FastAPI, SQLAlchemy, Alembic, APScheduler |
| Database | PostgreSQL 16 |
| Cache | Redis |
| Auth | JWT (access + refresh tokens), RBAC |
| Infra | Nginx, Gunicorn + Uvicorn, Docker Compose |
| CI/CD | GitHub Actions → DigitalOcean |

---

## Local Development

### Prerequisites

- Docker & Docker Compose
- Node.js 20+
- Python 3.12+

### Start with Docker

```bash
cp backend/.env.example backend/.env   # fill in secrets
docker compose up -d
```

| Service | URL |
|---|---|
| Frontend | http://localhost |
| API Docs | http://localhost/docs |
| Grafana | http://localhost:3000 |
| Prometheus | http://localhost:9090 |
| pgAdmin | http://localhost:5050 |

### Start without Docker

**Backend:**
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env                   # fill in secrets
cd migrations && alembic upgrade head
cd ..
python -m app.utils.seed_data          # optional seed data
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend/react-app
npm install
npm run dev                            # runs on http://localhost:5173
```

---

## Default Accounts (after seeding)

| Role | Email | Password |
|---|---|---|
| Super Admin | admin@azurehorizon.com | Admin@12345 |
| Staff | staff@azurehorizon.com | Staff@12345 |
| Guest | guest@example.com | Guest@12345 |

---

## Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in the values below.

| Variable | Required | Description |
|---|---|---|
| `SECRET_KEY` | ✅ | JWT signing key — min 32 chars (`openssl rand -hex 32`) |
| `DATABASE_URL` | ✅ | Async PostgreSQL DSN (`postgresql+asyncpg://...`) |
| `DATABASE_URL_SYNC` | ✅ | Sync PostgreSQL DSN for Alembic (`postgresql://...`) |
| `REDIS_URL` | ✅ | Redis DSN |
| `ALLOWED_ORIGINS` | ✅ | Comma-separated CORS origins |
| `EMAILS_ENABLED` | ❌ | Set `true` to enable SMTP emails |
| `SMTP_HOST/USER/PASSWORD` | ❌ | SMTP credentials |

---

## Project Structure

```
hotel_management_system/
├── backend/
│   ├── app/
│   │   ├── api/v1/
│   │   │   ├── admin/       # Admin endpoints (rooms, bookings, reports, users)
│   │   │   ├── public/      # Public endpoints (auth, rooms, search)
│   │   │   └── user/        # Guest endpoints (bookings, profile, payments)
│   │   ├── core/            # Config, database, security
│   │   ├── middleware/      # Auth, RBAC, rate limiting, observability
│   │   ├── models/          # SQLAlchemy ORM models
│   │   ├── repositories/    # DB query layer
│   │   ├── services/        # Business logic (auth, cache, email, payment)
│   │   ├── workers/         # APScheduler background jobs
│   │   └── utils/           # Logger, validators, seed data
│   ├── migrations/          # Alembic migrations
│   ├── static/avatars/      # Uploaded profile photos
│   └── requirements.txt
├── frontend/react-app/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── public/      # Home, Rooms, Booking, Login, Register
│   │   │   ├── user/        # Dashboard, MyBookings, Profile, Payments
│   │   │   ├── admin/       # Dashboard, Rooms, Bookings, Reports, Pricing
│   │   │   └── staff/       # Check-in/out, Tasks, Guest Requests
│   │   ├── contexts/        # AuthContext, ThemeContext
│   │   ├── services/        # Axios API clients
│   │   └── components/      # Navbar, Footer, UserProfileMenu
│   └── tailwind.config.js
├── .github/workflows/
│   ├── deploy-backend.yml   # Auto-deploy backend on push to main
│   └── deploy-frontend.yml  # Auto-deploy frontend on push to main
├── nginx/
├── observability/           # Prometheus, Grafana, Loki configs
└── docker-compose.yml
```

---

## Features

**Guest**
- Browse and search rooms with filters (price, type, amenities, dates)
- Real-time availability check
- Book rooms with date selection and guest count
- Secure payment flow with card validation
- Manage bookings (view, cancel)
- Profile management with photo upload
- Review and rate stays
- Real-time booking notifications via WebSocket
- Wishlist / saved rooms

**Staff**
- View assigned bookings and daily summary
- Process check-in / check-out
- Manage guest requests and tasks
- Room status board

**Admin**
- Full room and room-type management
- Booking oversight and manual check-in/out
- Dynamic pricing rules and blackout dates
- Revenue, occupancy, and guest analytics reports
- User and staff account management
- System activity logs

---

## Architecture

```
Browser
   │
Nginx (port 80)
   ├── /api/*   → Gunicorn + Uvicorn workers (FastAPI)
   ├── /static/ → Uploaded files (avatars)
   └── /*       → React SPA (index.html)
                      │
           ┌──────────┴──────────┐
        PostgreSQL            Redis
        (primary DB)          (cache + rate limiting)
                      │
               APScheduler
               (background jobs)
```

**Production (DigitalOcean):**
```
GitHub main branch
   │
   ├── backend/ change → GitHub Actions → rsync + migrate + restart
   └── frontend/ change → GitHub Actions → npm build + rsync → Nginx
```

Two-droplet setup:
- `hms-backend` (167.99.138.191) — Nginx + Gunicorn/Uvicorn
- `hms-db` (134.122.66.174) — PostgreSQL 16 (private network only)

---

## CI/CD

Push to `main` triggers automatic deployment via GitHub Actions.

| Workflow | Trigger | Steps |
|---|---|---|
| Deploy Backend | `backend/**` changed | rsync → pip install → alembic migrate → systemd restart |
| Deploy Frontend | `frontend/**` changed | npm build → rsync dist → nginx reload |

**Required GitHub Secrets:**

| Secret | Value |
|---|---|
| `DEPLOY_SSH_KEY` | Private SSH key for production server |
| `DEPLOY_HOST` | Production server IP |
| `DEPLOY_USER` | SSH username |

**Required GitHub Variables:**

| Variable | Value |
|---|---|
| `VITE_API_URL` | Backend API base URL (e.g. `http://your-server-ip`) |

---

## Database Migrations

```bash
# Run migrations
cd backend/migrations
alembic upgrade head

# Create a new migration
cd backend/migrations
alembic revision --autogenerate -m "describe your change"
```

---

## Key Implementation Details

- **Auth**: JWT access tokens (30 min) + refresh tokens (7 days). Token payload carries `user_id`, `role`, `hotel_id`. Full profile fetched from DB on login and merged into auth context.
- **RBAC**: Middleware enforces role-based access. Guest bookings derive `hotel_id` from the room, not the user.
- **Rate limiting**: Token-bucket algorithm implemented from scratch using Redis Lua scripts — atomic, fail-open.
- **Caching**: Room availability cached in Redis with 5-min TTL (~30× latency improvement).
- **Background jobs**: APScheduler runs `nightly_revenue_snapshot` at 02:00 UTC and `hourly_cache_warmup` every hour.
- **WebSocket**: Real-time booking status pushed to connected clients at `ws://{host}/api/v1/ws/{user_id}`.
- **Dark mode**: Full dark/light theme toggle with CSS variable-backed Tailwind tokens.
- **Multilingual**: 8 languages via i18next (EN, ES, FR, DE, ZH, JA, RU, AR).
- **Profile photos**: Upload endpoint validates MIME type and size, stores in `static/avatars/`, served via Nginx.

---

## CHANGELOG

### v1.1.0 — 2026-04-28
- GitHub Actions CI/CD (auto-deploy backend + frontend on push)
- Production infrastructure on DigitalOcean (2-droplet setup, private networking)
- Profile photo upload with avatar display across all views
- Dark/light theme toggle with full CSS variable support
- Language switcher fix (active state detection)
- Booking flow end-to-end fix (date widget → confirmation)
- Guest booking fix (hotel_id derived from room, not user)
- Registration error parsing fix (custom backend error format)

### v1.0.0 — 2026-04-15
- Full booking platform: search, book, pay, cancel
- JWT auth + RBAC (guest / staff / hotel_admin / super_admin)
- Dynamic pricing + blackout dates
- WebSocket real-time notifications
- Token-bucket rate limiter (Redis Lua)
- APScheduler nightly revenue batch
- Prometheus + Grafana + Loki observability
- Alembic migrations + seed data
- Redis availability cache
