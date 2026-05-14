# 📊 Observability — allStay Hotel Management System

The observability stack provides **metrics, logs, and distributed traces** for every component of the system. It is based on the industry-standard PLG stack (**Prometheus + Loki + Grafana**) augmented with **Jaeger** for distributed tracing and **Promtail** for log shipping.

---

## Table of Contents

1. [Stack Overview](#stack-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Files & Directory Structure](#files--directory-structure)
4. [Prometheus — Metrics Collection](#prometheus--metrics-collection)
5. [Grafana — Visualisation](#grafana--visualisation)
6. [Loki — Log Aggregation](#loki--log-aggregation)
7. [Promtail — Log Shipping](#promtail--log-shipping)
8. [Jaeger — Distributed Tracing](#jaeger--distributed-tracing)
9. [Exporters](#exporters)
10. [Backend Instrumentation](#backend-instrumentation)
11. [Accessing the Dashboards](#accessing-the-dashboards)
12. [Adding Custom Metrics](#adding-custom-metrics)
13. [Alerting](#alerting)

---

## Stack Overview

| Component | Role | Port | Image |
|---|---|---|---|
| Prometheus | Metrics collection & storage | 9090 | `prom/prometheus:v2.51.0` |
| Grafana | Dashboards & alerting UI | 3000 | `grafana/grafana:10.4.0` |
| Loki | Log aggregation & indexing | 3100 | `grafana/loki:2.9.5` |
| Promtail | Log shipper (Docker → Loki) | — | `grafana/promtail:2.9.5` |
| Jaeger | Distributed tracing | 16686 (UI), 4317 (OTLP) | `jaegertracing/all-in-one:1.57` |
| postgres_exporter | PostgreSQL → Prometheus | 9187 | `prometheuscommunity/postgres-exporter:v0.15.0` |
| redis_exporter | Redis → Prometheus | 9121 | `oliver006/redis_exporter:v1.60.0` |

---

## Architecture Diagram

```
┌─────────────┐    scrape /metrics     ┌──────────────┐
│ backend1    │ ──────────────────────► │              │
│ backend2    │                         │  Prometheus  │──► Grafana dashboards
│ (FastAPI)   │                         │  :9090       │
└─────────────┘                         └──────┬───────┘
                                               │ scrape
┌─────────────────┐  :9187                     │
│ postgres_exporter│ ──────────────────────────┤
└─────────────────┘                            │
                                               │
┌─────────────────┐  :9121                     │
│ redis_exporter  │ ──────────────────────────►│
└─────────────────┘

┌─────────────┐   push logs    ┌───────┐   query   ┌─────────┐
│  Promtail   │ ──────────────► │ Loki  │ ◄──────── │ Grafana │
│ (Docker     │                 │ :3100 │           │ :3000   │
│  log driver)│                 └───────┘           └─────────┘

┌─────────────┐   OTLP gRPC    ┌────────────────┐
│ FastAPI     │ ──────────────► │ Jaeger         │
│ (OTel SDK)  │   :4317        │ :16686 (UI)    │
└─────────────┘                └────────────────┘
```

---

## Files & Directory Structure

```
observability/
├── prometheus.yml                          # Prometheus scrape configuration
├── loki-config.yml                         # Loki server configuration
└── grafana/
    └── provisioning/
        ├── datasources/
        │   └── datasources.yml             # Auto-provisioned data sources
        └── dashboards/
            └── *.json                      # Auto-provisioned Grafana dashboards
```

---

## Prometheus — Metrics Collection

**Config file:** `observability/prometheus.yml`

```yaml
global:
  scrape_interval: 15s       # Pull metrics every 15 seconds
  evaluation_interval: 15s   # Evaluate alerting rules every 15 seconds

scrape_configs:
  - job_name: "allStay_backend"
    static_configs:
      - targets: ["backend1:8000", "backend2:8000"]
    metrics_path: /metrics

  - job_name: "nginx"
    static_configs:
      - targets: ["nginx:9113"]

  - job_name: "postgres"
    static_configs:
      - targets: ["postgres_exporter:9187"]

  - job_name: "redis"
    static_configs:
      - targets: ["redis_exporter:9121"]
```

### Scrape Targets

| Job | Target | What it exposes |
|---|---|---|
| `allStay_backend` | `backend1:8000`, `backend2:8000` | HTTP request counts, latency histograms, error rates, custom business metrics |
| `nginx` | `nginx:9113` | Nginx connection/request stats via nginx-prometheus-exporter |
| `postgres` | `postgres_exporter:9187` | DB connections, query times, replication lag, table sizes |
| `redis` | `redis_exporter:9121` | Memory usage, command rates, key counts, eviction stats |

### Key Metrics (Backend)

| Metric | Type | Description |
|---|---|---|
| `http_requests_total` | Counter | Total requests, labelled by method, path, status code |
| `http_request_duration_seconds` | Histogram | Request latency distribution |
| `http_requests_in_progress` | Gauge | Currently active requests |
| `celery_tasks_total` | Counter | Celery task completions by state (success/failure) |

---

## Grafana — Visualisation

**Config:** `observability/grafana/provisioning/datasources/datasources.yml`

Grafana is auto-provisioned on startup with two data sources:

```yaml
datasources:
  - name: Prometheus
    type: prometheus
    url: http://prometheus:9090
    isDefault: true    # default source for new panels

  - name: Loki
    type: loki
    url: http://loki:3100
```

Dashboard JSON files placed in `grafana/provisioning/dashboards/` are automatically loaded on container start — no manual import required.

### Default Dashboards

Place your dashboard JSON exports under `observability/grafana/provisioning/dashboards/`. Recommended dashboards to import from Grafana.com:

| Dashboard | ID | Description |
|---|---|---|
| Node Exporter Full | 1860 | Host CPU, memory, disk, network |
| PostgreSQL Database | 9628 | Query stats, connections, table bloat |
| Redis Dashboard | 11835 | Memory, commands, keyspace |
| FastAPI Observability | 16110 | HTTP metrics from prometheus-client |

### Access

- URL: **http://localhost:3000**
- Default credentials: `admin` / value of `GRAFANA_PASSWORD` env variable (default: `admin`)
- Sign-up is disabled (`GF_USERS_ALLOW_SIGN_UP=false`).

> **Change the default password immediately** in any non-local environment.

---

## Loki — Log Aggregation

**Config file:** `observability/loki-config.yml`

Loki stores and indexes logs shipped by Promtail. Key settings:

| Setting | Value | Notes |
|---|---|---|
| HTTP listen port | `3100` | Used by Promtail push and Grafana queries |
| Storage backend | `boltdb-shipper` + filesystem | Suitable for single-node; switch to S3/GCS for HA |
| Schema | `v11` | Stable schema from 2024-01-01 |
| Index period | `24h` | One index file per day |
| `reject_old_samples_max_age` | `168h` (7 days) | Prevents ingestion of very old log lines |
| Replication factor | `1` | Single-node mode |

### Querying Logs in Grafana

Switch to the **Loki** datasource in the Explore view and use LogQL:

```logql
# All backend logs
{container_name="hotel_backend1"}

# Error logs from any container
{job="docker"} |= "ERROR"

# Slow requests (>500ms) from the backend
{container_name=~"hotel_backend.*"} |~ "duration.*[5-9][0-9]{2}ms"
```

---

## Promtail — Log Shipping

Promtail runs as a sidecar container, reading Docker container logs and pushing them to Loki.

```yaml
# In docker-compose.yml
volumes:
  - /var/log:/var/log:ro
  - /var/lib/docker/containers:/var/lib/docker/containers:ro
  - /var/run/docker.sock:/var/run/docker.sock
environment:
  - LOKI_URL=http://loki:3100/loki/api/v1/push
```

Promtail automatically discovers containers via the Docker socket and adds labels (`container_name`, `image`, `compose_service`) to every log stream, making filtering in Grafana straightforward.

---

## Jaeger — Distributed Tracing

**UI:** http://localhost:16686

Jaeger receives traces from the FastAPI backend via **OpenTelemetry Protocol (OTLP) over gRPC** on port `4317`.

The backend (`core/tracing.py`) instruments:
- Every FastAPI HTTP handler (automatic via `opentelemetry-instrumentation-fastapi`)
- SQLAlchemy queries (automatic via `opentelemetry-instrumentation-sqlalchemy`)
- Redis calls (automatic via `opentelemetry-instrumentation-redis`)

### How to Use Jaeger UI

1. Open **http://localhost:16686**.
2. Select service `allStay_backend` from the dropdown.
3. Search traces by operation, duration, or tags.
4. Click a trace to see the waterfall breakdown: HTTP handler → DB query → Redis call.

### Disabling Tracing

Set `JAEGER_ENDPOINT=` (empty string) in `.env` to disable trace export without removing the instrumentation code.

---

## Exporters

### postgres_exporter

Connects to the primary database using `DATA_SOURCE_NAME` and exposes PostgreSQL metrics on port **9187**.

```
DATA_SOURCE_NAME=postgresql://user:pass@db:5432/hotel_system?sslmode=disable
```

Key metrics: `pg_up`, `pg_stat_database_*`, `pg_replication_*`, `pg_locks_count`.

### redis_exporter

Connects to Redis and exposes metrics on port **9121**.

```
REDIS_ADDR=redis://redis:6379
REDIS_PASSWORD=<your_redis_password>
```

Key metrics: `redis_up`, `redis_memory_used_bytes`, `redis_commands_total`, `redis_keyspace_*`.

---

## Backend Instrumentation

The `PrometheusMiddleware` in `backend/app/middleware/observability.py` intercepts every HTTP request and records:

- `http_requests_total` — labelled by `method`, `path`, `status_code`
- `http_request_duration_seconds` — histogram with buckets `[0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5]`
- `http_requests_in_progress` — gauge of concurrent requests

The endpoint `/metrics` is registered directly on the FastAPI app (not as a router) so it is always available regardless of middleware ordering.

---

## Accessing the Dashboards

| Service | URL | Credentials |
|---|---|---|
| Grafana | http://localhost:3000 | `admin` / `$GRAFANA_PASSWORD` |
| Prometheus | http://localhost:9090 | None (open) |
| Jaeger UI | http://localhost:16686 | None (open) |
| Loki (raw API) | http://localhost:3100 | None (open) |
| Flower (Celery) | http://localhost:5555 | None (dev only) |

> **Production note:** Firewall ports 9090, 16686, 3100, and 5555. Only expose Grafana (port 3000) publicly, and protect it with a strong password or SSO.

---

## Adding Custom Metrics

In any backend service file, import `prometheus_client` and define metrics at module level:

```python
from prometheus_client import Counter, Histogram

bookings_created = Counter(
    "bookings_created_total",
    "Total number of bookings created",
    ["room_type"]
)

# Increment in your service
bookings_created.labels(room_type="suite").inc()
```

Custom metrics are automatically included in the `/metrics` scrape response.

---

## Alerting

Grafana supports alert rules natively. To configure:

1. Open **Alerting → Alert rules** in Grafana.
2. Create a rule using PromQL (Prometheus datasource) or LogQL (Loki datasource).
3. Configure a contact point (Email, Slack, PagerDuty, etc.) under **Contact points**.
4. Assign the rule to an alert group with an appropriate evaluation interval.

**Example alert — high error rate:**

```promql
rate(http_requests_total{status_code=~"5.."}[5m])
/
rate(http_requests_total[5m])
> 0.05
```

Fires when more than 5% of requests return a 5xx status over a 5-minute window.
