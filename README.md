# Azure Horizon Hotel Management System

Full-stack distributed hotel management platform — React + FastAPI + PostgreSQL + Redis + Nginx.

## Quick Start (one command)

```bash
cp backend/.env.example .env     # fill in secrets
docker compose up -d             # starts all services
```

| Service | URL |
|---|---|
| **Frontend** | http://localhost |
| **API Docs (Swagger)** | http://localhost/docs |
| **Grafana** | http://localhost:3000 |
| **Prometheus** | http://localhost:9090 |
| **pgAdmin** | http://localhost:5050 |

Default seeded accounts:

| Role  | Email | Password |
|-------|-------|----------|
| Admin | admin@azurehorizon.com | Admin@12345 |
| Staff | staff@azurehorizon.com | Staff@12345 |
| Guest | guest@example.com | Guest@12345 |

## Run Migrations + Seed

```bash
cd backend
alembic upgrade head
python -m app.utils.seed_data
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `SECRET_KEY` | ✅ | JWT signing key (≥32 chars) |
| `DATABASE_URL` | ✅ | PostgreSQL DSN |
| `REDIS_URL` | ✅ | Redis DSN |
| `POSTGRES_USER` | ✅ | DB username |
| `POSTGRES_PASSWORD` | ✅ | DB password |
| `POSTGRES_DB` | ✅ | DB name |
| `REDIS_PASSWORD` | ✅ | Redis password |
| `ALLOWED_ORIGINS` | ✅ | Comma-separated CORS origins |
| `GRAFANA_PASSWORD` | ❌ | Grafana admin password (default: admin) |
| `PGADMIN_EMAIL` | ❌ | pgAdmin email |
| `PGADMIN_PASSWORD` | ❌ | pgAdmin password |
| `EMAILS_ENABLED` | ❌ | Enable SMTP emails |
| `SMTP_HOST/USER/PASSWORD` | ❌ | SMTP credentials |

## Architecture

```
Browser → Nginx (port 80)
            ├── /api/*  → backend1:8000 ┐ least_conn
            ├── /ws/*   → backend1:8000 ┘ load-balanced
            └── /*      → React static build
                  │
       ┌──────────┴──────────┐
    backend1             backend2
          │
  ┌───────┼────────┐
Postgres Redis  APScheduler
                    │
      Prometheus ← /metrics
      Grafana   (dashboards)
      Loki      (logs via Promtail)
```

## Key Design Components

**R11 — Token-Bucket Rate Limiter (from scratch)**
`backend/app/components/token_bucket.py` — Redis Lua script, atomic token consumption, fail-open.

**R10 — Batch Pipeline**
APScheduler jobs: `nightly_revenue_snapshot` (02:00 UTC) + `hourly_cache_warmup`.

**R7 — WebSocket**
`ws://{host}/ws/{user_id}` — real-time booking status push to connected clients.

**R5 — Redis Polyglot Persistence**
Availability cache with 5-min TTL. ~12ms → ~0.4ms latency improvement.

## Contributor Guide

```bash
git checkout -b feature/your-feature
cd backend && python -m pytest
# open PR against main
```

## CHANGELOG

### v1.0.0 — 2026-04-27
- Full booking platform: search, book, pay, cancel, modify
- JWT auth + RBAC (guest / staff / admin)
- Dynamic pricing + blackout dates
- Guest count + cancellation policy (booking.com parity)
- WebSocket real-time notifications (R7)
- Token-bucket rate limiter from scratch (R11)
- APScheduler nightly revenue batch (R10)
- Prometheus + Grafana + Loki observability (R12)
- Nginx load-balancing across 2 replicas (R8)
- Alembic migrations + seed data (R3)
- Redis availability cache — 30× latency improvement (R5/R6)
