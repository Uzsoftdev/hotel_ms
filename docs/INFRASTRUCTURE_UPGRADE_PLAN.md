# allStay HMS — Infrastructure Upgrade Plan

## Codebase Reality Check

Before starting any phase, these findings from direct code inspection affect sequencing:

| Finding | Impact |
|---------|--------|
| `database.py` is **fully synchronous** (no async engine) | PgBouncer must use `transaction` mode, not `session` |
| `conftest.py` is `# TODO: implement tests` | Zero test confidence — fix before deploying anything |
| `prometheus.yml` references `postgres_exporter` and `redis_exporter` but both are **missing from `docker-compose.yml`** | Easiest observability win — add containers, done |
| `security.py` never generates a `jti` claim | Must add `jti` before blacklist can work |
| `ws_manager` is an **in-process Python dict** | WS messages sent on `backend1` never reach clients on `backend2` — already broken in production |
| Avatar uploads go to the **disk of whichever replica serves the request** | Files are not shared between replicas — MinIO fixes this |
| `email.py` uses `asyncio.create_task()` from sync context | Tasks are silently dropped — Celery fixes this |
| `background_tasks.py` calls sync `SessionLocal()` inside `async def` | Latent bug — Celery migration fixes it cleanly |

---

## Architecture Target

```
Internet
    │
    ▼
Cloudflare (free CDN + DDoS protection)
    │  Caches: JS/CSS/images at 300+ edge nodes globally
    │
    ▼
Traefik (replaces Nginx)
    ├── Auto SSL via Let's Encrypt (free HTTPS)
    ├── Auto-discovers new containers on scale-up
    ├── Circuit breaker + retry built-in
    │
    ├── /api/*  ──→  Backend Pool (8 containers × 4 workers = 32 async processes)
    ├── /ws/*   ──→  Backend Pool (WebSocket upgrade, sticky sessions)
    └── /*      ──→  React SPA (static, served from Cloudflare edge)

Backend Pool
    ├── PostgreSQL Primary + 3 Read Replicas via PgBouncer (connection pooling)
    ├── Redis Cluster — Pub/Sub for WebSocket broadcast across replicas
    ├── Meilisearch — full-text hotel/room search, typo-tolerant, <50ms
    └── MinIO — S3-compatible object storage (avatars, room images, invoices)

Celery Workers (8 processes)
    ├── send_confirmation_email.delay()
    ├── process_payment.delay()
    └── push_notification.delay()

Celery Beat (replaces APScheduler)
    ├── nightly_revenue_snapshot (02:00 UTC)
    └── hourly_cache_warmup (:00 each hour)

Observability Stack
    ├── Prometheus
    │     ├── postgres_exporter
    │     ├── redis_exporter
    │     └── cadvisor
    ├── Grafana (dashboards + alerts)
    ├── Loki (log aggregation)
    └── Jaeger (distributed tracing)
```

---

## Phase Summary

| Phase | Item | Effort | Downtime |
|-------|------|--------|----------|
| 1 — Now | PgBouncer + read replicas | 2–3 days | Zero |
| 1 — Now | Fix postgres_exporter + redis_exporter | 2 hours | Zero |
| 1 — Now | Token blacklist on logout | Half day | Zero |
| 1 — Now | Integration tests + conftest | 2–3 days | Zero |
| 2 — Next | Celery + Redis broker | 2 days | Zero |
| 2 — Next | Redis Pub/Sub for WebSockets | 1 day | Zero |
| 2 — Next | Traefik replacing Nginx | 1.5 days | ~2 min |
| 2 — Next | Meilisearch | 1.5 days | Zero |
| 3 — Scale | Gunicorn process manager | 2 hours | Zero |
| 3 — Scale | MinIO for file storage | 1.5 days | Zero |
| 3 — Scale | Aggressive cache layering | 1 day | Zero |
| 3 — Scale | Jaeger tracing | 1 day | Zero |
| 3 — Scale | Docker Swarm | 2–3 days | ~30 sec |
| 4 — Polish | Booking table partitioning | 1 day | 2–10 min |
| 4 — Polish | Password reset + email verify | 1.5 days | Zero |
| 4 — Polish | Grafana dashboards JSON | Half day | Zero |
| 4 — Polish | Cloudflare free tier | 2–4 hours | Zero |

---

## Dependency Graph

```
1.2 (exporters)  ─────────────────────────────────────────► 4.3 (dashboards)
1.3 (blacklist)  ─────────────────────────────────────────► 4.2 (pw reset)
1.4 (tests)      ─── runs alongside all items ────────────► all phases
1.1 (pgbouncer)  ──► 2.1 (celery)  ──► 2.2 (ws pubsub)  ──► 3.1 (gunicorn)
                                    └──► 3.5 (swarm)
2.1 (celery)     ──► 2.4 (meilisearch indexing tasks)
2.1 (celery)     ──► 3.4 (jaeger — trace across tasks)
2.2 (ws pubsub)  ──► 3.1 (gunicorn — safe to add workers)
2.3 (traefik)    ──► 3.5 (swarm) ──► 4.4 (cloudflare)
3.2 (minio)      ─── independent after Phase 2
```

---

## Phase 1 — Now

### 1.1 PgBouncer + Read Replicas

**Why:** DB is the #1 bottleneck. PgBouncer multiplexes connections; read replicas offload heavy GET queries (search, reports, listings).

**Effort:** 2–3 days | **Downtime:** Zero

#### Files to create

`docker/pgbouncer.ini`
```ini
[databases]
hotel_primary  = host=db       port=5432 dbname=${POSTGRES_DB}
hotel_replica1 = host=db_replica1 port=5432 dbname=${POSTGRES_DB}

[pgbouncer]
listen_port         = 6432
listen_addr         = 0.0.0.0
auth_type           = scram-sha-256
auth_file           = /etc/pgbouncer/userlist.txt
pool_mode           = transaction   ; MUST be transaction — session mode gives no benefit
                                    ; with DBSessionMiddleware pattern
max_client_conn     = 1000
default_pool_size   = 25
reserve_pool_size   = 5
server_idle_timeout = 600
log_connections     = 0
```

`docker/postgres-replica.conf`
```
primary_conninfo = 'host=db port=5432 user=replicator password=${REPLICATION_PASSWORD} sslmode=prefer'
hot_standby      = on
wal_level        = replica
max_wal_senders  = 5
wal_keep_size    = 256MB
```

`docker/init-replication.sh`
```bash
#!/bin/bash
psql -U ${POSTGRES_USER} -c "CREATE USER replicator REPLICATION LOGIN ENCRYPTED PASSWORD '${REPLICATION_PASSWORD}';"
psql -U ${POSTGRES_USER} -c "SELECT pg_create_physical_replication_slot('replica1_slot');"
```

#### Files to modify

**`docker-compose.yml`** — add after `db` service:
```yaml
db_replica1:
  image: postgres:15
  environment:
    POSTGRES_USER: ${POSTGRES_USER}
    POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    POSTGRES_DB: ${POSTGRES_DB}
  volumes:
    - postgres_replica1_data:/var/lib/postgresql/data
    - ./docker/postgres-replica.conf:/etc/postgresql/recovery.conf:ro
  depends_on:
    db:
      condition: service_healthy
  networks:
    - hotel_network
  command: >
    bash -c "
      until pg_basebackup -h db -D /var/lib/postgresql/data -U replicator -Fp -Xs -P -R; do
        sleep 2
      done && postgres
    "

pgbouncer:
  image: pgbouncer/pgbouncer:1.22.1
  environment:
    PGBOUNCER_POOL_MODE: transaction
    PGBOUNCER_MAX_CLIENT_CONN: 1000
    PGBOUNCER_DEFAULT_POOL_SIZE: 25
    POSTGRESQL_USERNAME: ${POSTGRES_USER}
    POSTGRESQL_PASSWORD: ${POSTGRES_PASSWORD}
  depends_on:
    db:
      condition: service_healthy
  networks:
    - hotel_network
  ports:
    - "6432:6432"
```

**`backend/app/core/config.py`** — add:
```python
DATABASE_URL_PRIMARY: str = ""   # write path via PgBouncer → primary
DATABASE_URL_REPLICA: str = ""   # read path via PgBouncer → replica(s)
```

**`backend/app/core/database.py`** — add read engine alongside existing write engine:
```python
write_engine = create_engine(settings.DATABASE_URL_PRIMARY or sync_url, pool_pre_ping=True, pool_size=10, max_overflow=20)
read_engine  = create_engine(settings.DATABASE_URL_REPLICA  or sync_url, pool_pre_ping=True, pool_size=20, max_overflow=40)

WriteSession = sessionmaker(autocommit=False, autoflush=False, bind=write_engine)
ReadSession  = sessionmaker(autocommit=False, autoflush=False, bind=read_engine)

SessionLocal = WriteSession   # keep for Alembic + background_tasks backward compat
```

**`backend/app/dependencies.py`** — add:
```python
def get_read_db() -> Session:
    db = ReadSession()
    try:
        yield db
    finally:
        db.close()
```

Route these endpoints to `get_read_db`: `GET /public/search/`, `GET /admin/reports/*`, `GET /admin/rooms/`, `GET /admin/bookings/`, `GET /user/bookings/`.

#### Gotchas

- **Alembic must bypass PgBouncer.** `DATABASE_URL_SYNC` in `env.py` must point directly to the primary — Alembic's migration lock uses `CREATE TABLE alembic_version` with an exclusive lock that is incompatible with PgBouncer transaction mode.
- **`DBSessionMiddleware` in `middleware/auth.py`** creates one session per request via `SessionLocal()` directly — it bypasses `dependency_overrides`. Keep it on the write engine.

---

### 1.2 Fix postgres_exporter + redis_exporter

**Why:** `prometheus.yml` already scrapes `postgres_exporter:9187` and `redis_exporter:9121` — both containers are simply missing from `docker-compose.yml`.

**Effort:** 2 hours | **Downtime:** Zero

#### Files to modify

**`docker-compose.yml`** — add:
```yaml
postgres_exporter:
  image: prometheuscommunity/postgres-exporter:v0.15.0
  environment:
    DATA_SOURCE_NAME: "postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}?sslmode=disable"
  depends_on:
    db:
      condition: service_healthy
  networks:
    - hotel_network

redis_exporter:
  image: oliver006/redis_exporter:v1.60.0
  environment:
    REDIS_ADDR: "redis://redis:6379"
    REDIS_PASSWORD: ${REDIS_PASSWORD}
  depends_on:
    - redis
  networks:
    - hotel_network
```

`prometheus.yml` — no change needed, already correct.

---

### 1.3 Token Blacklist on Logout

**Why:** JWTs are never revoked on logout. A stolen token stays valid for up to 30 minutes (access) or 7 days (refresh).

**Effort:** Half day | **Downtime:** Zero

#### Files to create

**`backend/app/services/token_blacklist.py`**
```python
from datetime import datetime, timezone
from app.services.cache import get_redis

BLACKLIST_PREFIX = "bl:jti:"

def blacklist_token(jti: str, exp: int) -> None:
    now = int(datetime.now(timezone.utc).timestamp())
    ttl = max(exp - now, 1)
    get_redis().setex(f"{BLACKLIST_PREFIX}{jti}", ttl, "1")

def is_blacklisted(jti: str) -> bool:
    return get_redis().exists(f"{BLACKLIST_PREFIX}{jti}") == 1
```

#### Files to modify

**`backend/app/core/security.py`** — add `jti` to every token:
```python
import uuid

def _build_token(data: dict, expires_delta: timedelta) -> str:
    payload = dict(data)
    payload["jti"] = uuid.uuid4().hex
    payload["exp"] = datetime.now(timezone.utc) + expires_delta
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITHM)
```

**`backend/app/dependencies.py`** — check blacklist in `get_current_user`:
```python
from app.services.token_blacklist import is_blacklisted

# inside get_current_user, after decoding:
jti = payload.get("jti")
if jti and is_blacklisted(jti):
    raise credentials_exc
```

**`backend/app/api/v1/public/auth.py`** — add logout endpoint:
```python
@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(token: str = Depends(oauth2_scheme)) -> None:
    try:
        payload = decode_token(token)
        jti, exp = payload.get("jti"), payload.get("exp")
        if jti and exp:
            blacklist_token(jti, int(exp))
    except Exception:
        pass   # expired/invalid tokens — silently succeed
```

#### Gotchas

- **Backward compat:** Tokens issued before this deploy have no `jti`. The check `if jti and is_blacklisted(jti)` naturally treats these as not blacklisted — zero forced re-logins.
- **Refresh token:** Accept an optional `refresh_token` body field in the logout endpoint and blacklist both tokens.

---

### 1.4 Integration Tests + conftest.py

**Why:** Zero test coverage. No confidence deploying any of the above changes.

**Effort:** 2–3 days | **Downtime:** Zero

#### Files to create

**`backend/requirements-dev.txt`**
```
pytest==8.3.3
pytest-asyncio==0.24.0
httpx==0.28.1
testcontainers[postgres,redis]==4.8.1
factory-boy==3.3.1
```

**`backend/pytest.ini`**
```ini
[pytest]
testpaths = tests
asyncio_mode = auto
```

**`backend/tests/conftest.py`**
```python
import pytest
from testcontainers.postgres import PostgresContainer
from testcontainers.redis import RedisContainer
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import Base
from app.dependencies import get_db
from app.core.config import settings

@pytest.fixture(scope="session")
def pg_container():
    with PostgresContainer("postgres:15") as pg:
        yield pg

@pytest.fixture(scope="session")
def redis_container():
    with RedisContainer("redis:7-alpine") as r:
        yield r

@pytest.fixture(scope="session")
def db_engine(pg_container):
    engine = create_engine(pg_container.get_connection_url())
    Base.metadata.create_all(engine)
    yield engine
    Base.metadata.drop_all(engine)

@pytest.fixture()
def db_session(db_engine):
    Session = sessionmaker(bind=db_engine)
    session = Session()
    yield session
    session.rollback()
    session.close()

@pytest.fixture()
def client(db_session, monkeypatch, redis_container):
    monkeypatch.setattr(settings, "REDIS_URL", redis_container.get_connection_url())

    app.dependency_overrides[get_db] = lambda: db_session
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
```

**`backend/tests/factories.py`** — factory_boy factories for User, Hotel, Room, Booking.

**`backend/tests/test_auth.py`** — register → login → get token → logout → verify token is rejected.

**`backend/tests/test_bookings.py`** — create booking, check availability, cancel.

#### Gotchas

- **`DBSessionMiddleware` bypasses `dependency_overrides`** — it calls `SessionLocal()` directly. Also monkeypatch `database.SessionLocal` in conftest to point at the test DB engine.
- **APScheduler starts in every test run** via the `lifespan` event. Add a `TESTING=true` env flag in config that skips `start_scheduler()`.

---

## Phase 2 — Next

### 2.1 Celery + Redis Broker

**Why:** Decouples email/payment from HTTP request path. Fixes silent email drops (`asyncio.create_task()` from sync context). Replaces APScheduler with Celery Beat.

**Effort:** 2 days | **Downtime:** Zero

#### Files to create

**`backend/app/celery_app.py`**
```python
from celery import Celery
from celery.schedules import crontab
from app.core.config import settings

celery_app = Celery(
    "hotel_tasks",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["app.tasks.email_tasks", "app.tasks.payment_tasks", "app.tasks.batch_tasks"],
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    task_acks_late=True,
    worker_prefetch_multiplier=1,
)

celery_app.conf.beat_schedule = {
    "nightly-revenue-snapshot": {
        "task": "app.tasks.batch_tasks.nightly_revenue_snapshot",
        "schedule": crontab(hour=2, minute=0),
    },
    "hourly-cache-warmup": {
        "task": "app.tasks.batch_tasks.hourly_cache_warmup",
        "schedule": crontab(minute=0),
    },
}
```

**`backend/app/tasks/email_tasks.py`**
```python
from app.celery_app import celery_app
import asyncio

@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def send_booking_confirmation_task(self, to, full_name, booking_id, check_in, check_out, room, total):
    try:
        asyncio.run(_send_confirmation_email(to, full_name, booking_id, check_in, check_out, room, total))
    except Exception as exc:
        raise self.retry(exc=exc)
```

**`backend/app/tasks/payment_tasks.py`**
```python
@celery_app.task(bind=True, max_retries=2)
def process_payment_task(self, booking_id, user_id, amount, method, currency):
    from app.core.database import SessionLocal
    db = SessionLocal()
    try:
        from app.services.payment import process_payment
        process_payment(db, booking_id, user_id, Decimal(amount), method, currency)
    finally:
        db.close()
```

**`backend/app/tasks/batch_tasks.py`** — move `nightly_revenue_snapshot` and `hourly_cache_warmup` logic verbatim from `background_tasks.py`, wrapped in `@celery_app.task`.

**`docker/Dockerfile.celery`**
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt celery[redis]==5.4.0 flower==2.0.1
COPY backend/ .
CMD ["celery", "-A", "app.celery_app", "worker", "--loglevel=info", "--concurrency=8"]
```

#### Files to modify

**`backend/requirements.txt`** — add `celery[redis]==5.4.0`, `flower==2.0.1`

**`docker-compose.yml`** — add:
```yaml
celery_worker:
  build:
    context: .
    dockerfile: docker/Dockerfile.celery
  command: celery -A app.celery_app worker --loglevel=info --concurrency=8
  depends_on: [redis, db]
  env_file: .env
  networks: [hotel_network]

celery_beat:
  build:
    context: .
    dockerfile: docker/Dockerfile.celery
  command: celery -A app.celery_app beat --loglevel=info
  depends_on: [redis]
  env_file: .env
  networks: [hotel_network]

flower:
  build:
    context: .
    dockerfile: docker/Dockerfile.celery
  command: celery -A app.celery_app flower --port=5555
  ports: ["5555:5555"]
  depends_on: [redis]
  networks: [hotel_network]
```

**`backend/app/services/email.py`** — replace `asyncio.create_task(_send(...))` with `send_email_task.delay(...)`.

**`backend/app/workers/background_tasks.py`** — stub `start_scheduler` / `stop_scheduler` to no-ops. Keep the shell so `main.py` doesn't break. Remove once Celery Beat is confirmed working.

#### Gotchas

- **`celery_beat` must always be exactly ONE replica.** In Swarm (Phase 3): `deploy.replicas: 1` with `placement.constraints: [node.role == manager]`. Two Beat instances = duplicate tasks.
- **Do not use `django_celery_beat`** — this is a FastAPI project. Use the built-in file-based scheduler.

---

### 2.2 Redis Pub/Sub for WebSocket Broadcast

**Why:** Fixes the existing production bug — WS messages only reach clients connected to the same backend replica that triggered the event.

**Effort:** 1 day | **Downtime:** Zero

#### Files to modify

**`backend/app/services/websocket.py`** — complete rewrite:
```python
import asyncio, json
from collections import defaultdict
import redis.asyncio as aioredis
from fastapi import WebSocket
from app.core.config import settings

CHANNEL = "ws:events"

class ConnectionManager:
    def __init__(self) -> None:
        self._connections: dict[int, list[WebSocket]] = defaultdict(list)
        self._redis: aioredis.Redis | None = None
        self._subscriber_task: asyncio.Task | None = None

    async def start_subscriber(self) -> None:
        self._redis = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
        pubsub = self._redis.pubsub()
        await pubsub.subscribe(CHANNEL)
        self._subscriber_task = asyncio.create_task(self._listen(pubsub))

    async def _listen(self, pubsub) -> None:
        async for message in pubsub.listen():
            if message["type"] != "message":
                continue
            envelope = json.loads(message["data"])
            user_id = envelope.get("user_id")
            if user_id:
                await self._local_send(user_id, envelope["event"], envelope["data"])

    async def _local_send(self, user_id: int, event: str, data: dict) -> None:
        for ws in list(self._connections.get(user_id, [])):
            try:
                await ws.send_json({"event": event, "data": data})
            except Exception:
                self._connections[user_id].remove(ws)

    async def publish(self, user_id: int | None, event: str, data: dict) -> None:
        envelope = json.dumps({"user_id": user_id, "event": event, "data": data})
        await self._redis.publish(CHANNEL, envelope)

    async def send_to_user(self, user_id: int, event: str, data: dict) -> None:
        await self.publish(user_id, event, data)

    async def connect(self, user_id: int, ws: WebSocket) -> None:
        await ws.accept()
        self._connections[user_id].append(ws)

    async def disconnect(self, user_id: int, ws: WebSocket) -> None:
        self._connections[user_id].remove(ws)
```

**`backend/app/main.py`** — update `lifespan`:
```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    await ws_manager.start_subscriber()
    start_scheduler()
    yield
    stop_scheduler()
```

#### Gotchas

- `redis.asyncio` is already available in `redis>=4.2` — no new dependency.
- The subscriber `asyncio.Task` must be held as `self._subscriber_task` to prevent garbage collection.
- Verify all `ws_manager.send_to_user(...)` call sites are awaited: `grep -r "ws_manager.send_to_user"`.

---

### 2.3 Traefik Replacing Nginx

**Why:** Auto-discovers containers on scale-up, free Let's Encrypt SSL, circuit breaker + retry built in. Nginx requires manual upstream changes on every scaling event.

**Effort:** 1.5 days | **Downtime:** ~2 minutes (port 80/443 rebind)

#### Files to create

**`docker/traefik.yml`** (static config)
```yaml
entryPoints:
  web:
    address: ":80"
    http:
      redirections:
        entryPoint:
          to: websecure
          scheme: https
  websecure:
    address: ":443"

providers:
  docker:
    endpoint: "unix:///var/run/docker.sock"
    exposedByDefault: false
    network: hotel_network

certificatesResolvers:
  letsencrypt:
    acme:
      email: ${ACME_EMAIL}
      storage: /letsencrypt/acme.json
      httpChallenge:
        entryPoint: web

api:
  dashboard: true
  insecure: false

log:
  level: WARN

accessLog: {}
```

**`docker/traefik-dynamic.yml`** (circuit breaker + retry)
```yaml
http:
  middlewares:
    circuit-breaker:
      circuitBreaker:
        expression: "NetworkErrorRatio() > 0.30 || ResponseCodeRatio(500, 600, 0, 600) > 0.25"
    retry:
      retry:
        attempts: 3
        initialInterval: 100ms
```

#### Files to modify

**`docker-compose.yml`** — remove `nginx` service, add:
```yaml
traefik:
  image: traefik:v3.1
  restart: always
  ports:
    - "80:80"
    - "443:443"
    - "8080:8080"   # Dashboard — firewall in production
  volumes:
    - /var/run/docker.sock:/var/run/docker.sock:ro
    - ./docker/traefik.yml:/etc/traefik/traefik.yml:ro
    - ./docker/traefik-dynamic.yml:/etc/traefik/dynamic.yml:ro
    - traefik_certs:/letsencrypt
  networks:
    - hotel_network

nginx_static:
  image: nginx:1.25-alpine
  volumes:
    - ./frontend/react-app/dist:/usr/share/nginx/html:ro
  labels:
    - "traefik.enable=true"
    - "traefik.http.routers.frontend.rule=Host(`yourdomain.com`)"
    - "traefik.http.routers.frontend.entrypoints=websecure"
    - "traefik.http.routers.frontend.tls.certresolver=letsencrypt"
    - "traefik.http.routers.frontend.priority=1"
  networks:
    - hotel_network
```

Add to `backend1` and `backend2`:
```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.backend.rule=Host(`yourdomain.com`) && (PathPrefix(`/api`) || PathPrefix(`/ws`) || PathPrefix(`/docs`) || PathPrefix(`/health`) || PathPrefix(`/metrics`) || PathPrefix(`/static`))"
  - "traefik.http.routers.backend.entrypoints=websecure"
  - "traefik.http.routers.backend.tls.certresolver=letsencrypt"
  - "traefik.http.routers.backend.middlewares=circuit-breaker,retry"
  - "traefik.http.services.backend.loadbalancer.server.port=8000"
  - "traefik.http.services.backend.loadbalancer.sticky.cookie.name=SERVERID"
  - "traefik.http.services.backend.loadbalancer.sticky.cookie.secure=true"
  - "traefik.http.routers.backend.priority=10"
```

**`nginx/nginx.conf`** → rename to `nginx/nginx.conf.bak` (keep as reference).

#### Gotchas

- **Sticky sessions are transitional.** Keep them until Redis Pub/Sub (2.2) is stable in production — without Pub/Sub, WS clients must stay on the same replica.
- **`VITE_API_URL` must use `https://`** after this deploy. Update GitHub Variables and redeploy frontend.
- **Breaking change:** HTTP → HTTPS redirect. Check any hardcoded `http://` URLs in `api.js`.

---

### 2.4 Meilisearch

**Why:** Replace SQL scans with typo-tolerant full-text search. Hotel/room discovery queries run in <50ms with Meilisearch vs. full table scans. Availability checking stays in Postgres.

**Effort:** 1.5 days | **Downtime:** Zero

**Design:** Meilisearch handles *discovery* (text query → candidate room IDs). Postgres handles *availability* (date-range overlap exclusion). The two compose: `search_rooms(q) → room_ids → get_available_rooms(room_ids, check_in, check_out)`.

#### Files to create

**`backend/app/services/search.py`**
```python
import meilisearch
from app.core.config import settings

_client: meilisearch.Client | None = None

def get_meilisearch() -> meilisearch.Client:
    global _client
    if _client is None:
        _client = meilisearch.Client(settings.MEILISEARCH_URL, settings.MEILISEARCH_KEY)
    return _client

def search_hotels(query: str, city: str | None = None) -> list[dict]:
    filters = f'city = "{city}"' if city else ""
    return get_meilisearch().index("hotels").search(query, {"filter": filters})["hits"]

def search_rooms(query: str, hotel_id: int | None = None) -> list[dict]:
    filters = f"hotel_id = {hotel_id}" if hotel_id else ""
    return get_meilisearch().index("rooms").search(query, {"filter": filters, "limit": 50})["hits"]
```

**`backend/app/tasks/indexing_tasks.py`**
```python
from app.celery_app import celery_app

@celery_app.task
def reindex_hotel(hotel_id: int) -> None:
    from app.core.database import SessionLocal
    from app.services.search import get_meilisearch
    db = SessionLocal()
    try:
        hotel = db.query(Hotel).get(hotel_id)
        get_meilisearch().index("hotels").add_documents([hotel_to_dict(hotel)])
    finally:
        db.close()

@celery_app.task
def reindex_room(room_id: int) -> None: ...
```

**`backend/scripts/meilisearch_seed.py`** — one-time seed from Postgres. Must call `update_filterable_attributes(["hotel_id", "is_active", "city"])` on each index before seeding.

#### Files to modify

**`backend/app/core/config.py`** — add:
```python
MEILISEARCH_URL: str = "http://meilisearch:7700"
MEILISEARCH_KEY: str = ""
```

**`backend/requirements.txt`** — add `meilisearch==0.31.2`

**`backend/app/api/v1/public/search.py`** — add new endpoint (keep existing availability endpoint intact):
```python
@router.get("/hotels")
def text_search_hotels(q: str, city: str | None = None, db: Session = Depends(get_read_db)):
    hits = search_hotels(q, city)
    hotel_ids = [h["id"] for h in hits]
    return db.query(Hotel).filter(Hotel.id.in_(hotel_ids)).all()
```

**`backend/app/api/v1/admin/hotels.py`** — dispatch `reindex_hotel.delay(hotel.id)` after create and update.

**`docker-compose.yml`** — add:
```yaml
meilisearch:
  image: getmeili/meilisearch:v1.7.3
  environment:
    MEILI_MASTER_KEY: ${MEILISEARCH_KEY}
    MEILI_ENV: production
  volumes:
    - meilisearch_data:/meili_data
  networks:
    - hotel_network
```

---

## Phase 3 — Scale

### 3.1 Gunicorn Process Manager

**Why:** Stable worker recycling under load. `--max-requests` prevents memory leaks from accumulating across thousands of requests.

**Effort:** 2 hours | **Downtime:** Zero

**Must-have prerequisite:** Redis Pub/Sub (2.2) deployed first. With 4 workers per container × 2 containers = 8 `ws_manager` instances. Without Pub/Sub, 7/8 WS clients receive no messages.

#### Files to modify

**`docker/Dockerfile.backend`** — change CMD:
```dockerfile
RUN pip install gunicorn==22.0.0
CMD ["gunicorn", "app.main:app", \
     "--worker-class", "uvicorn.workers.UvicornWorker", \
     "--workers", "4", \
     "--bind", "0.0.0.0:8000", \
     "--max-requests", "1000", \
     "--max-requests-jitter", "100", \
     "--timeout", "60", \
     "--graceful-timeout", "30", \
     "--access-logfile", "-", \
     "--error-logfile", "-"]
```

**`backend/requirements.txt`** — add `gunicorn==22.0.0`

#### Gotchas

- APScheduler currently starts in every Gunicorn worker process. Once Celery Beat is active, the scheduler has no jobs — it logs startup noise but causes no harm. Set `TESTING=true` pattern to skip it.

---

### 3.2 MinIO for File Storage

**Why:** Fixes the existing multi-replica bug — avatars uploaded to `backend1` 404 when the next request hits `backend2`.

**Effort:** 1.5 days | **Downtime:** Zero (gradual migration)

#### Files to create

**`backend/app/services/storage.py`**
```python
import boto3
from app.core.config import settings

_s3_client = None

def get_storage():
    global _s3_client
    if _s3_client is None:
        _s3_client = boto3.client(
            "s3",
            endpoint_url=settings.MINIO_URL,
            aws_access_key_id=settings.MINIO_ACCESS_KEY,
            aws_secret_access_key=settings.MINIO_SECRET_KEY,
        )
    return _s3_client

def upload_avatar(file_bytes: bytes, filename: str, content_type: str) -> str:
    get_storage().put_object(
        Bucket=settings.MINIO_BUCKET,
        Key=f"avatars/{filename}",
        Body=file_bytes,
        ContentType=content_type,
        ACL="public-read",
    )
    return f"{settings.MINIO_PUBLIC_URL}/{settings.MINIO_BUCKET}/avatars/{filename}"

def delete_avatar(url: str) -> None:
    key = url.split(f"/{settings.MINIO_BUCKET}/")[1]
    get_storage().delete_object(Bucket=settings.MINIO_BUCKET, Key=key)
```

**`backend/scripts/migrate_avatars_to_minio.py`** — one-time migration: iterate `users.photo_url`, upload each file from disk to MinIO, update `photo_url` in DB.

#### Files to modify

**`backend/app/core/config.py`** — add:
```python
MINIO_URL: str = "http://minio:9000"
MINIO_PUBLIC_URL: str = "http://localhost:9000"
MINIO_ACCESS_KEY: str = ""
MINIO_SECRET_KEY: str = ""
MINIO_BUCKET: str = "hotel-assets"
```

**`backend/app/api/v1/user/profile.py`** — replace disk I/O in `upload_photo`:
```python
# Remove: os.makedirs, open(), os.path, os.remove
# Replace with:
from app.services.storage import upload_avatar
url = upload_avatar(await file.read(), f"user_{user_id}_{file.filename}", file.content_type)
```

**`backend/requirements.txt`** — add `boto3==1.35.0`

**`backend/app/main.py`** — remove `app.mount("/static", StaticFiles(...))` **after** migration script confirms all avatars are in MinIO.

**`docker-compose.yml`** — add:
```yaml
minio:
  image: minio/minio:RELEASE.2024-09-13T20-26-02Z
  command: server /data --console-address ":9001"
  environment:
    MINIO_ROOT_USER: ${MINIO_ACCESS_KEY}
    MINIO_ROOT_PASSWORD: ${MINIO_SECRET_KEY}
  volumes:
    - minio_data:/data
  ports:
    - "9001:9001"   # Console — firewall in production
  networks:
    - hotel_network
```

#### Gotchas

- `photo_url` values change from `/static/avatars/file.jpg` to `https://minio.../avatars/file.jpg`. Frontend uses the URL value directly — full URLs are backward compatible. Keep both formats working during the migration window.

---

### 3.3 Aggressive Cache Layering

**Why:** Profile, hotel listings, and room details are read far more than they change. Caching them avoids redundant DB round-trips on every page load.

**Effort:** 1 day | **Downtime:** Zero

#### What to cache

| Resource | Key pattern | TTL | Invalidate on |
|----------|-------------|-----|---------------|
| Hotel list | `hotels:list` | 300s | hotel create/update/delete |
| Hotel detail | `hotel:{id}` | 300s | hotel update/delete |
| User profile | `profile:{user_id}` | 60s | profile update, photo upload |
| Pricing rules | `pricing:{hotel_id}` | 600s | already defined in `cache.py`, not yet used |

#### Files to modify

**`backend/app/services/cache.py`** — add typed key helpers:
```python
HOTEL_LIST_TTL = 300
HOTEL_DETAIL_TTL = 300
PROFILE_TTL = 60

def hotel_list_key() -> str:         return "hotels:list"
def hotel_detail_key(id: int) -> str: return f"hotel:{id}"
def profile_key(user_id: int) -> str: return f"profile:{user_id}"
```

**`backend/app/api/v1/user/profile.py`** — cache `get_profile` response; invalidate in `update_profile` and `upload_photo`.

**`backend/app/api/v1/admin/hotels.py`** (or hotel service) — wrap list/detail reads with cache; invalidate keys on mutations.

#### Gotchas

- SQLAlchemy ORM instances aren't JSON-serializable. Cache Pydantic schema output (`.model_dump()`) not raw model objects.

---

### 3.4 Jaeger Distributed Tracing

**Why:** Find slow requests across service boundaries (HTTP → DB → Redis → Celery task). Without tracing, a slow P95 in Grafana tells you nothing about which hop is slow.

**Effort:** 1 day | **Downtime:** Zero

#### Files to create

**`backend/app/core/tracing.py`**
```python
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor
from opentelemetry.instrumentation.redis import RedisInstrumentor
from app.core.config import settings

def setup_tracing(app) -> None:
    if not settings.JAEGER_ENDPOINT:
        return
    exporter = OTLPSpanExporter(endpoint=settings.JAEGER_ENDPOINT)
    provider = TracerProvider()
    provider.add_span_processor(BatchSpanProcessor(exporter))
    trace.set_tracer_provider(provider)
    FastAPIInstrumentor.instrument_app(app)
    SQLAlchemyInstrumentor().instrument(engine=write_engine)
    RedisInstrumentor().instrument()
```

#### Files to modify

**`backend/app/main.py`** — call `setup_tracing(app)` before middleware registration.

**`backend/app/core/config.py`** — add:
```python
JAEGER_ENDPOINT: str = "http://jaeger:4317"
```

**`backend/requirements.txt`** — add:
```
opentelemetry-api==1.27.0
opentelemetry-sdk==1.27.0
opentelemetry-instrumentation-fastapi==0.48b0
opentelemetry-instrumentation-sqlalchemy==0.48b0
opentelemetry-instrumentation-redis==0.48b0
opentelemetry-exporter-otlp-proto-grpc==1.27.0
```

**`docker-compose.yml`** — add:
```yaml
jaeger:
  image: jaegertracing/all-in-one:1.60
  environment:
    COLLECTOR_OTLP_ENABLED: "true"
  ports:
    - "16686:16686"   # UI — firewall in production
    - "4317:4317"     # OTLP gRPC
  networks:
    - hotel_network
```

---

### 3.5 Docker Swarm

**Why:** Scale backend to 8+ replicas with one command. Rolling zero-downtime updates built in.

**Recommendation:** Swarm over k3s for the current single-DigitalOcean-droplet setup. `docker swarm init` on the existing machine. When a second node is added later, `docker swarm join` and raise `replicas` — no YAML changes needed.

**Effort:** 2–3 days | **Downtime:** ~30 sec (Swarm network init)

#### Files to create

**`docker-stack.yml`** (Swarm-compatible stack, replaces `docker-compose.yml` in production)
```yaml
version: "3.9"
services:
  backend:
    image: registry.digitalocean.com/youraccount/hotel-backend:${TAG}
    deploy:
      replicas: 8
      update_config:
        parallelism: 2
        delay: 10s
        order: start-first   # zero-downtime rolling update
      restart_policy:
        condition: on-failure
    networks:
      - hotel_network

  celery_beat:
    image: registry.digitalocean.com/youraccount/hotel-celery:${TAG}
    command: celery -A app.celery_app beat --loglevel=info
    deploy:
      replicas: 1            # CRITICAL: exactly one Beat instance
      placement:
        constraints:
          - node.role == manager
    networks:
      - hotel_network
```

#### Files to modify

**`.github/workflows/deploy-backend.yml`** — replace rsync + SSH script:
```yaml
- name: Build and push image
  uses: docker/build-push-action@v5
  with:
    push: true
    tags: registry.digitalocean.com/youraccount/hotel-backend:${{ github.sha }}

- name: Deploy stack
  run: |
    ssh ${{ secrets.DEPLOY_HOST }} \
      "TAG=${{ github.sha }} docker stack deploy -c /opt/hms/docker-stack.yml hotel --with-registry-auth"
```

---

## Phase 4 — Polish

### 4.1 Booking Table Partitioning

**Why:** As bookings grow into millions of rows, date-range queries slow down. Partitioning by `check_in` month keeps query plans hitting only relevant partitions.

**Effort:** 1 day | **Downtime:** 2–10 min (table rebuild)

#### Files to create

**`backend/migrations/versions/YYYYMMDD_0005_partition_bookings.py`**
```python
def upgrade():
    op.execute("ALTER TABLE bookings RENAME TO bookings_old")
    op.execute("""
        CREATE TABLE bookings (
            LIKE bookings_old INCLUDING ALL
        ) PARTITION BY RANGE (check_in)
    """)
    op.execute("SELECT partman.create_parent('public.bookings', 'check_in', 'native', 'monthly')")
    op.execute("INSERT INTO bookings SELECT * FROM bookings_old")
    op.execute("DROP TABLE bookings_old")
```

#### Gotchas

- **Foreign keys from `payments.booking_id`** must be dropped and recreated on the partitioned table.
- **Partition key `check_in` must be part of every unique constraint** — the primary key becomes `(id, check_in)` in PostgreSQL partitioned tables.
- Install `pg_partman` extension: add `shared_preload_libraries = 'pg_partman_bgw'` to Postgres config. Add `pg_partman` to the db container.
- Use `pg_repack` if truly zero-downtime is required.

---

### 4.2 Password Reset + Email Verification

**Why:** Auth is incomplete. Guests can register with any email — no verification. No way to recover a forgotten password.

**Effort:** 1.5 days | **Downtime:** Zero

#### Files to create

**`backend/app/models/email_verification.py`**
```python
class EmailVerification(Base):
    __tablename__ = "email_verifications"
    id         = Column(Integer, primary_key=True)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False)
    token      = Column(String, unique=True, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    used_at    = Column(DateTime(timezone=True), nullable=True)
```

**`backend/app/models/password_reset.py`** — same structure, different table name.

**`backend/migrations/versions/YYYYMMDD_0006_email_verification_password_reset.py`**

#### Files to modify

**`backend/app/models/user.py`** — add:
```python
is_email_verified = Column(Boolean, default=False, nullable=False)
```

**`backend/app/api/v1/public/auth.py`** — add four endpoints:
- `POST /auth/verify-email` — accepts token, marks `is_email_verified = True`
- `POST /auth/resend-verification` — dispatches `send_verification_email_task.delay()`
- `POST /auth/forgot-password` — creates reset token, dispatches email task
- `POST /auth/reset-password` — validates token, updates `hashed_password`

#### Gotchas

- **Migration must set `is_email_verified = True` for all existing users** — otherwise every current user is locked out if you enforce verification before login.

---

### 4.3 Grafana Dashboards JSON

**Why:** Observability is blind without provisioned panels. Dashboards defined in JSON are version-controlled and survive container restarts.

**Effort:** Half day | **Downtime:** Zero

#### Files to create

**`observability/grafana/provisioning/dashboards/dashboards.yml`**
```yaml
apiVersion: 1
providers:
  - name: default
    orgId: 1
    folder: ""
    type: file
    options:
      path: /etc/grafana/provisioning/dashboards
```

**`observability/grafana/provisioning/dashboards/hotel-overview.json`** — panels:
- HTTP request rate (`rate(http_requests_total[5m])`)
- P95 / P99 latency (`histogram_quantile(0.95, http_request_duration_seconds_bucket)`)
- Active WebSocket connections (`active_websocket_connections`)
- Redis cache hit rate (`cache_hits_total / (cache_hits_total + cache_misses_total)`)
- Postgres active connections (`pg_stat_activity_count`)
- Redis memory (`redis_memory_used_bytes`)
- Error rate by status code

**`observability/grafana/provisioning/dashboards/postgres-detail.json`** — import community dashboard ID 9628.

**`observability/grafana/provisioning/dashboards/redis-detail.json`** — import community dashboard ID 763.

#### Files to modify

**`docker-compose.yml`** — verify grafana volume mounts include dashboards:
```yaml
grafana:
  volumes:
    - grafana_data:/var/lib/grafana
    - ./observability/grafana/provisioning:/etc/grafana/provisioning:ro
```

---

### 4.4 Cloudflare Free Tier

**Why:** Offloads static asset bandwidth globally. ~300 edge nodes serve the React SPA instead of your single DigitalOcean droplet.

**Effort:** 2–4 hours (mostly DNS propagation) | **Downtime:** Zero

#### Steps

1. Move domain DNS to Cloudflare nameservers.
2. Set `A` record pointing to DigitalOcean droplet IP with **proxy enabled** (orange cloud).
3. Set SSL/TLS mode to **Full (Strict)** — not Flexible (Flexible would connect Cloudflare → backend over HTTP).
4. Create Page Rules:
   - `yourdomain.com/static/*` → Cache Everything, Edge Cache TTL: 1 month
   - `yourdomain.com/api/*` → Cache Level: Bypass
   - `yourdomain.com/ws/*` → Cache Level: Bypass

#### Files to modify

**`docker/traefik.yml`** — optionally switch to DNS Challenge (avoids any HTTP challenge timing issues behind Cloudflare):
```yaml
certificatesResolvers:
  letsencrypt:
    acme:
      dnsChallenge:
        provider: cloudflare
        resolvers: ["1.1.1.1:53"]
```

Add `CF_API_TOKEN` to Traefik environment in `docker-compose.yml`.

#### Gotchas

- **`ALLOWED_ORIGINS` in `config.py`** — no change needed. Cloudflare passes `Origin` headers through unchanged.
- **Cloudflare free tier WebSocket limit:** 100 connections/sec. More than sufficient for a hotel management system.

---

## New Environment Variables Summary

| Phase | Variable | Purpose |
|-------|----------|---------|
| 1 | `DATABASE_URL_PRIMARY` | Write path via PgBouncer |
| 1 | `DATABASE_URL_REPLICA` | Read path via PgBouncer |
| 1 | `REPLICATION_PASSWORD` | Postgres streaming replication user |
| 2 | `MEILISEARCH_URL` | `http://meilisearch:7700` |
| 2 | `MEILISEARCH_KEY` | Meilisearch master key |
| 2 | `ACME_EMAIL` | Let's Encrypt registration email |
| 3 | `MINIO_URL` | `http://minio:9000` |
| 3 | `MINIO_PUBLIC_URL` | Public-facing MinIO URL |
| 3 | `MINIO_ACCESS_KEY` | MinIO root user |
| 3 | `MINIO_SECRET_KEY` | MinIO root password |
| 3 | `MINIO_BUCKET` | `hotel-assets` |
| 3 | `JAEGER_ENDPOINT` | `http://jaeger:4317` |
| 4 | `CF_API_TOKEN` | Cloudflare DNS challenge token |

---

## Breaking Changes

| Item | Change | What to do |
|------|--------|------------|
| 1.3 Token blacklist | New `POST /auth/logout` endpoint | Frontend must call `/auth/logout` on sign-out, not just clear localStorage |
| 2.3 Traefik | HTTP → HTTPS redirect | Update `VITE_API_URL` to `https://`, update `ALLOWED_ORIGINS` |
| 3.2 MinIO | `photo_url` format changes from `/static/avatars/file.jpg` to full URL | Frontend handles full URLs — backward compatible during migration window |
| 4.2 Email verify | New `is_email_verified` column | Migration must set `true` for all existing users |

---

## Central Risk File

`backend/app/core/database.py` is the highest-risk file in this plan. `SessionLocal` is imported directly in `background_tasks.py`, `migrations/env.py`, and via `DBSessionMiddleware`. Every phase that touches DB routing goes through here. Before modifying it:

```bash
grep -r "SessionLocal\|from app.core.database" backend/
```

Verify all import sites, then update them in the same commit.
