# 🐳 Docker — allStay Hotel Management System

This directory contains all Docker-specific build and configuration files. The full system is orchestrated by `docker-compose.yml` at the project root, with production deployments using Docker Swarm via `docker-stack.yml`.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Files in This Directory](#files-in-this-directory)
3. [Service Map](#service-map)
4. [Dockerfiles](#dockerfiles)
5. [Traefik Reverse Proxy](#traefik-reverse-proxy)
6. [PgBouncer Connection Pooler](#pgbouncer-connection-pooler)
7. [PostgreSQL Streaming Replication](#postgresql-streaming-replication)
8. [Network & Volumes](#network--volumes)
9. [Environment Variables](#environment-variables)
10. [Common Operations](#common-operations)
11. [Production Deployment (Swarm)](#production-deployment-swarm)
12. [Health Checks](#health-checks)
13. [Port Reference](#port-reference)

---

## Quick Start

```bash
# 1. Clone and enter the project
git clone <repo-url>
cd hotel_ms

# 2. Set up environment variables
cp backend/.env.example .env
# Edit .env — replace all REPLACE_* values with real credentials

# 3. Build and start all services
docker compose up -d --build

# 4. Run database migrations
docker compose exec backend1 alembic upgrade head

# 5. Verify everything is healthy
docker compose ps
```

The application will be available at **http://localhost** (Traefik routes to the appropriate backend or frontend).

---

## Files in This Directory

| File | Description |
|---|---|
| `Dockerfile.backend` | Backend API image (Python 3.11 + Gunicorn) |
| `Dockerfile.celery` | Celery worker/beat/flower image (same base as backend) |
| `Dockerfile.frontend` | Frontend image (currently minimal — see note below) |
| `traefik.yml` | Traefik static configuration (entrypoints, providers, ACME) |
| `traefik-dynamic.yml` | Traefik dynamic configuration (routers, middlewares, services) |
| `pgbouncer.ini` | PgBouncer connection pooler config |
| `nginx-static.conf` | Nginx config for the `nginx_static` static-file server |
| `nginx.conf` | Minimal nginx config (symlink / override for static container) |
| `init-replication.sh` | PostgreSQL init script to create replication user and slot |
| `deploy.sh` | Helper script for production Swarm deployments |

> **Note on `Dockerfile.frontend`:** The React app is built locally (`npm run build`) and the `dist/` output is mounted into the `nginx_static` container as a volume. A proper multi-stage Dockerfile build can be added when CI/CD is configured.

---

## Service Map

```
docker-compose.yml defines 20 services:

Infrastructure
  ├── db               PostgreSQL 15 primary
  ├── db_replica1      PostgreSQL 15 read replica (streaming replication)
  ├── pgbouncer        PgBouncer connection pooler
  └── redis            Redis 7 (cache + Celery broker)

Application
  ├── backend1         FastAPI + Gunicorn replica 1
  ├── backend2         FastAPI + Gunicorn replica 2
  ├── celery_worker    Celery task worker (concurrency 8)
  ├── celery_beat      Celery Beat scheduler (1 replica only!)
  └── flower           Celery Flower monitor

Storage & Search
  ├── minio            MinIO S3-compatible object storage
  └── meilisearch      Meilisearch full-text search engine

Gateway
  ├── traefik          Traefik v3 reverse proxy + TLS
  └── nginx_static     Nginx serving React SPA static files

Observability
  ├── prometheus       Metrics collection
  ├── grafana          Dashboards
  ├── loki             Log aggregation
  ├── promtail         Log shipper (Docker → Loki)
  ├── jaeger           Distributed tracing
  ├── postgres_exporter PostgreSQL → Prometheus
  └── redis_exporter   Redis → Prometheus

Dev Tools
  └── pgadmin          pgAdmin 4 database GUI
```

---

## Dockerfiles

### `Dockerfile.backend`

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

- **`python:3.11-slim`** — minimal base image for smaller attack surface.
- **Gunicorn** with **UvicornWorker** — production-grade ASGI process manager.
- **4 workers** — tune to `2 * CPU_CORES + 1` for CPU-bound work; for I/O-heavy FastAPI, higher counts (8–16) may help.
- **`--max-requests 1000`** + jitter — recycles workers periodically to prevent memory leaks.
- **`--timeout 120`** — 2-minute timeout for long-running requests (file uploads, report generation).

### `Dockerfile.celery`

Identical base to `Dockerfile.backend`. The default CMD runs the **worker**; `docker-compose.yml` overrides it for `celery_beat` and `flower` services:

```yaml
celery_beat:
  command: celery -A app.celery_app beat --loglevel=info

flower:
  command: celery -A app.celery_app flower --port=5555
```

---

## Traefik Reverse Proxy

Traefik v3 acts as the **entry point for all external traffic**, providing:

- **Automatic HTTP → HTTPS redirect** (port 80 → 443)
- **TLS certificate management** via Let's Encrypt (ACME)
- **Load balancing** across backend replicas
- **Circuit breaker** and **retry** middleware
- **WebSocket** support (automatic upgrade handling)

### Static Config (`traefik.yml`)

| Setting | Value |
|---|---|
| HTTP entrypoint | `:80` → redirects to HTTPS |
| HTTPS entrypoint | `:443` |
| Provider | Docker socket (auto-discovers labeled services) |
| ACME resolver | `letsencrypt` (HTTP-01 challenge) |
| DNS resolver | `letsencrypt-dns` (Cloudflare DNS-01, for CF-proxied domains) |
| Dashboard | `:8080` (insecure — firewall in production) |

### Dynamic Config (`traefik-dynamic.yml`)

#### Middlewares

| Middleware | Purpose |
|---|---|
| `circuit-breaker` | Opens if >30% network errors or >25% 5xx responses |
| `retry` | Retries failed requests up to 3 times (100ms initial interval) |
| `www-redirect` | Redirects `www.allstay.rest` → `allstay.rest` |
| `minio-strip` | Strips `/storage` prefix before proxying to MinIO |

#### Routers

| Router | Rule | Priority |
|---|---|---|
| `backend` | API / WS / docs / health / metrics paths | 10 (higher wins) |
| `minio` | `/storage/*` paths | 20 |
| `frontend` | All other paths (catch-all) | 1 |

#### Sticky Sessions

WebSocket connections require affinity to a single backend replica (before Redis Pub/Sub is fully proven in production). Traefik implements sticky sessions via a secure cookie named `SERVERID`:

```yaml
traefik.http.services.backend.loadbalancer.sticky.cookie.name: SERVERID
traefik.http.services.backend.loadbalancer.sticky.cookie.secure: "true"
traefik.http.services.backend.loadbalancer.sticky.cookie.httponly: "true"
```

### SSL Certificates

**Option 1 — HTTP-01 challenge (default):** Domain must be publicly reachable on port 80.

```dotenv
DOMAIN=yourdomain.com
ACME_EMAIL=you@email.com
```

**Option 2 — DNS-01 challenge (Cloudflare):** Required when the domain is behind Cloudflare proxy (HTTP challenge blocked).

```dotenv
CF_API_TOKEN=your_cloudflare_api_token
```

Switch router labels to `tls.certresolver=letsencrypt-dns`.

---

## PgBouncer Connection Pooler

PgBouncer sits between the backend and PostgreSQL, reducing connection overhead at scale.

| Setting | Value | Reason |
|---|---|---|
| Pool mode | `transaction` | Connection returned to pool after each transaction — highest efficiency |
| Max client connections | `1000` | Supports many concurrent app workers |
| Default pool size | `25` | Actual PostgreSQL connections per database |
| Reserve pool | `5` | Emergency connections for spikes |
| Server idle timeout | `600s` | Closes unused server connections after 10 minutes |

**Connection flow:**

```
Backend workers ──► PgBouncer :6432 ──► PostgreSQL :5432
     (1000 possible)     (pools to)          (25 actual)
```

The backend connects to PgBouncer via `DATABASE_URL_PRIMARY` (port 6432 inside the Docker network).

---

## PostgreSQL Streaming Replication

The primary database is configured for **streaming replication** with one read replica.

### How It Works

1. `init-replication.sh` runs at first startup on the primary and creates:
   - A `replicator` user with `REPLICATION` privilege
   - A replication slot `replica1_slot`

2. `db_replica1` runs `pg_basebackup` to clone the primary, then starts in **hot-standby** mode (read-only, streaming WAL from primary).

3. The backend can route read-heavy queries (search, reports) to `DATABASE_URL_REPLICA` (pointing at `db_replica1`).

### WAL Settings (on primary)

| Setting | Value |
|---|---|
| `wal_level` | `replica` |
| `max_wal_senders` | `5` |
| `wal_keep_size` | `256 MB` |
| `hot_standby` | `on` |

---

## Network & Volumes

### Network

All services join `hotel_network` (Docker bridge driver). Services communicate by container name (DNS resolution is built into Docker networking).

```yaml
networks:
  hotel_network:
    driver: bridge
```

### Named Volumes

| Volume | Used by | Description |
|---|---|---|
| `postgres_data` | `db` | Primary PostgreSQL data files |
| `postgres_replica1_data` | `db_replica1` | Replica data files |
| `redis_data` | `redis` | Redis AOF persistence |
| `prometheus_data` | `prometheus` | Metrics time-series storage |
| `grafana_data` | `grafana` | Dashboards, alert rules, users |
| `loki_data` | `loki` | Log chunk storage |
| `traefik_certs` | `traefik` | Let's Encrypt certificates |
| `meilisearch_data` | `meilisearch` | Search index storage |
| `minio_data` | `minio` | Object storage (avatars, images) |

---

## Environment Variables

Copy `backend/.env.example` to the project root as `.env`. Variables consumed by Docker Compose:

| Variable | Used by | Description |
|---|---|---|
| `POSTGRES_USER` | `db`, `db_replica1`, `pgbouncer` | Database superuser |
| `POSTGRES_PASSWORD` | All DB services | Database password |
| `POSTGRES_DB` | All DB services | Database name |
| `REDIS_PASSWORD` | `redis`, `redis_exporter` | Redis auth password |
| `REPLICATION_PASSWORD` | `init-replication.sh` | Streaming replication user password |
| `PGADMIN_EMAIL` | `pgadmin` | pgAdmin login email |
| `PGADMIN_PASSWORD` | `pgadmin` | pgAdmin login password |
| `DOMAIN` | Traefik labels | Your production domain (e.g. `allstay.rest`) |
| `ACME_EMAIL` | `traefik.yml` | Email for Let's Encrypt registration |
| `CF_API_TOKEN` | `traefik` | Cloudflare API token for DNS-01 ACME |
| `MEILISEARCH_KEY` | `meilisearch` | Meilisearch master key |
| `MINIO_ACCESS_KEY` | `minio` | MinIO root user |
| `MINIO_SECRET_KEY` | `minio` | MinIO root password |
| `GRAFANA_PASSWORD` | `grafana` | Grafana admin password |

---

## Common Operations

```bash
# Start all services in the background
docker compose up -d

# Start with a fresh build (after code changes)
docker compose up -d --build

# View logs from all services
docker compose logs -f

# View logs from a specific service
docker compose logs -f backend1

# Shell into a running container
docker compose exec backend1 bash

# Run Alembic migrations inside the container
docker compose exec backend1 alembic upgrade head

# Restart a single service
docker compose restart backend1

# Stop all services (data preserved in volumes)
docker compose down

# Stop all services AND remove volumes (destructive — wipes all data)
docker compose down -v

# Scale backend workers (nginx upstream must be updated too)
docker compose up -d --scale backend=3
```

---

## Production Deployment (Swarm)

The `docker-stack.yml` file is used for Docker Swarm deployments.

```bash
# Initialize Swarm (first time only)
docker swarm init

# Deploy the stack
docker stack deploy -c docker-stack.yml hotel

# Check service status
docker stack services hotel

# Update a service image (rolling update)
docker service update --image <new_image> hotel_backend1

# Remove the stack
docker stack rm hotel
```

The `docker/deploy.sh` script automates common Swarm deployment steps — review it before running in production.

---

## Health Checks

All critical services define health checks in `docker-compose.yml`:

| Service | Health check | Interval | Retries |
|---|---|---|---|
| `db` | `pg_isready` | 10s | 5 |
| `db_replica1` | `pg_isready` | 15s | 5 |
| `pgbouncer` | `pg_isready -p 6432` | 10s | 5 |
| `redis` | `redis-cli ping` | 10s | 5 |
| `backend1/2` | `curl /health` | 15s | 3 |
| `minio` | `curl /minio/health/live` | 15s | 5 |
| `meilisearch` | `curl /health` | 15s | 5 |

Services that `depends_on` a dependency with `condition: service_healthy` will not start until that dependency passes its health check.

---

## Port Reference

| Port | Service | Notes |
|---|---|---|
| `80` | Traefik | HTTP (redirects to 443 in production) |
| `443` | Traefik | HTTPS |
| `8080` | Traefik dashboard | **Firewall in production** |
| `3000` | Grafana | Monitoring dashboards |
| `3100` | Loki | Log API (internal) |
| `5050` | pgAdmin | **Dev only — firewall in production** |
| `5555` | Flower | Celery monitor — **dev only** |
| `9000` | MinIO S3 API | **Firewall in production** (proxied via Traefik) |
| `9001` | MinIO Console | **Firewall in production** |
| `9090` | Prometheus | **Firewall in production** |
| `16686` | Jaeger UI | **Firewall in production** |
| `4317` | Jaeger OTLP gRPC | Internal only |
