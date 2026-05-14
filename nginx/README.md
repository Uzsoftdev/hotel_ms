# 🌐 Nginx — allStay Hotel Management System

This directory contains the **Nginx configuration** used in local / staging environments as a combined reverse proxy and static file server. In Docker Compose, Nginx sits behind **Traefik** and is responsible solely for serving the compiled React SPA (`nginx_static` service).

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Files](#files)
3. [Configuration Breakdown](#configuration-breakdown)
4. [Upstream Load Balancing](#upstream-load-balancing)
5. [Location Blocks](#location-blocks)
6. [WebSocket Proxying](#websocket-proxying)
7. [Static File Caching](#static-file-caching)
8. [Security Considerations](#security-considerations)
9. [Local Usage (without Docker)](#local-usage-without-docker)
10. [Tuning Tips](#tuning-tips)

---

## Architecture Overview

```
Internet
    │
    ▼
 Traefik (ports 80 / 443)
    │  TLS termination + HTTP→HTTPS redirect
    │  Circuit breaker + retry middleware
    │
    ├──► nginx_static (port 80)   ←── serves React SPA (dist/)
    │
    └──► backend1:8000  ┐
         backend2:8000  ┘  Gunicorn + Uvicorn workers (load balanced)
```

In local development (no Docker) the `nginx/nginx.conf` file is used directly. It performs **both** the reverse-proxy role and serves static files.

---

## Files

| File | Description |
|---|---|
| `nginx.conf` | Active configuration |
| `nginx.conf.bak` | Backup of last known-good config |

Additionally, `docker/nginx-static.conf` is used inside the `nginx_static` Docker image for pure static-file serving (no proxy rules needed there — Traefik handles routing).

---

## Configuration Breakdown

### `nginx/nginx.conf`

```nginx
upstream backend {
    least_conn;                  # route to least-busy backend instance
    server backend1:8000;
    server backend2:8000;
    keepalive 32;                # reuse connections to backend
}
```

A single `server` block listens on port **80**. In Docker this is placed behind Traefik which handles TLS; in bare-metal deployments add an HTTPS server block.

---

## Upstream Load Balancing

| Setting | Value | Reason |
|---|---|---|
| Algorithm | `least_conn` | Distributes to the replica with fewest active connections — better than round-robin for long-lived requests (e.g. file uploads, WebSocket handshakes) |
| `keepalive 32` | 32 idle connections per worker | Reduces TCP handshake overhead for frequent API calls |

---

## Location Blocks

### `/api/` — REST API proxy

```nginx
location /api/ {
    proxy_pass         http://backend;
    proxy_http_version 1.1;
    proxy_set_header   Host              $host;
    proxy_set_header   X-Real-IP         $remote_addr;
    proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header   X-Forwarded-Proto $scheme;
    proxy_read_timeout 60s;
}
```

- All API traffic forwarded to the upstream backend cluster.
- `X-Forwarded-For` header allows the backend to log the real client IP behind the proxy.
- 60-second read timeout accommodates slow report generation endpoints.

### `/ws/` — WebSocket proxy

See [WebSocket Proxying](#websocket-proxying) below.

### `~ ^/(docs|redoc|openapi\.json)` — API docs

FastAPI's Swagger UI and ReDoc are forwarded directly to the backend.

### `/metrics` — Prometheus scrape

Proxies `/metrics` to the backend's Prometheus endpoint. **Remove this location block or restrict by IP in production** to prevent public metric exposure.

### `/health` — Health check

Used by load balancers and Docker healthchecks to verify the backend is alive.

### `/static/` — Backend uploaded files

```nginx
location /static/ {
    expires 7d;
    add_header Cache-Control "public";
}
```

Files uploaded through the backend (avatars, documents) are served with a **7-day cache TTL** via `Cache-Control: public`.

### `/` — React SPA

```nginx
location / {
    root   /usr/share/nginx/html;
    index  index.html;
    try_files $uri $uri/ /index.html;
}
```

`try_files` ensures that refreshing any deep React Router path (e.g. `/user/bookings`) returns `index.html` rather than a 404. The browser-side router then handles navigation.

---

## WebSocket Proxying

```nginx
location /ws/ {
    proxy_pass         http://backend;
    proxy_http_version 1.1;
    proxy_set_header   Upgrade    $http_upgrade;
    proxy_set_header   Connection "upgrade";
    proxy_set_header   Host       $host;
    proxy_set_header   X-Real-IP  $remote_addr;
    proxy_read_timeout 3600s;
}
```

Key points:

- `Upgrade` and `Connection "upgrade"` headers are mandatory for the HTTP → WebSocket handshake.
- `proxy_read_timeout 3600s` (1 hour) prevents idle WebSocket connections from being closed by Nginx's default 60-second timeout.
- In Docker, Traefik also handles WebSocket upgrade for the `websecure` entrypoint — these headers are set in both layers.

---

## Static File Caching

| Resource | Cache TTL | Header |
|---|---|---|
| React SPA (`/`) | No cache (served fresh) | — |
| Backend static (`/static/`) | 7 days | `Cache-Control: public` |

For the React SPA, versioned asset filenames (Vite appends content hashes) make long-lived caching safe for JS/CSS bundles. The `index.html` itself should not be aggressively cached in production — consider adding `Cache-Control: no-cache` for the root document.

---

## Security Considerations

| Concern | Current state | Recommendation |
|---|---|---|
| `/metrics` exposure | Proxied publicly | Restrict by IP or remove in production |
| `client_max_body_size` | 20 MB | Adjust based on maximum expected file upload size |
| HTTPS | Delegated to Traefik | Ensure Traefik TLS is active before exposing to internet |
| `X-Frame-Options` | Not set | Add `add_header X-Frame-Options SAMEORIGIN;` |
| `X-Content-Type-Options` | Not set | Add `add_header X-Content-Type-Options nosniff;` |
| `Referrer-Policy` | Not set | Add `add_header Referrer-Policy strict-origin-when-cross-origin;` |

---

## Local Usage (without Docker)

```bash
# Install Nginx
sudo apt install nginx

# Copy config
sudo cp nginx/nginx.conf /etc/nginx/conf.d/hotel.conf

# Test config syntax
sudo nginx -t

# Reload
sudo nginx -s reload
```

Ensure:
- The backend is running on `localhost:8000` (or adjust upstream server addresses).
- The React build output (`dist/`) is copied to `/usr/share/nginx/html/`.

---

## Tuning Tips

```nginx
# In nginx.conf http block (not shown — add at /etc/nginx/nginx.conf level):
worker_processes      auto;             # one worker per CPU core
worker_connections    1024;             # max concurrent connections per worker
gzip                  on;              # compress API JSON and static text
gzip_types            application/json text/css application/javascript;
gzip_min_length       1000;            # don't compress tiny responses
```

For high-traffic deployments, consider enabling **HTTP/2** on the HTTPS listener and setting up **Let's Encrypt** auto-renewal via Certbot or Traefik's built-in ACME resolver.
