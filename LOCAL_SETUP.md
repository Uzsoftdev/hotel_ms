# Running allStay Locally on macOS

This guide runs the backend and frontend as native processes (faster hot-reload) with only the three required infrastructure services in Docker.

---

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Docker Desktop | latest | https://www.docker.com/products/docker-desktop/ |
| Python | 3.11+ | `brew install python@3.11` |
| Node.js | 20+ | `brew install node` |
| Git | any | pre-installed on macOS |

Check you have them:
```bash
docker --version
python3 --version
node --version
```

---

## 1. Clone the repo

```bash
git clone https://github.com/Uzsoftdev/hotel_ms.git
cd hotel_ms
```

---

## 2. Create the root `.env` (for Docker infra)

Create a file called `.env` in the project root:

```bash
cat > .env << 'EOF'
POSTGRES_USER=hotel_user
POSTGRES_PASSWORD=localpass
POSTGRES_DB=hotel_system
REDIS_PASSWORD=localpass
REPLICATION_PASSWORD=localpass
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=localpass
MINIO_BUCKET=hotel-avatars
PGADMIN_PASSWORD=admin
MEILISEARCH_KEY=localkey
DOMAIN=localhost
ACME_EMAIL=dev@localhost.local
EOF
```

---

## 3. Start infrastructure (PostgreSQL + Redis + MinIO only)

```bash
docker compose up -d db redis minio
```

Wait about 10 seconds for Postgres to finish initialising, then verify:
```bash
docker compose ps db redis minio
```
All three should show **healthy** or **running**.

MinIO web console is available at http://localhost:9001 (login: `minioadmin` / `localpass`).

---

## 4. Set up the backend

### 4a. Create `backend/.env`

```bash
cat > backend/.env << 'EOF'
APP_NAME="allStay Hotel API"
ENVIRONMENT=development
DEBUG=true

SECRET_KEY=local-dev-secret-key-change-this-32ch
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

DATABASE_URL=postgresql://hotel_user:localpass@localhost:5432/hotel_system

REDIS_URL=redis://:localpass@localhost:6379/0

MINIO_ENDPOINT=http://localhost:9000
MINIO_PUBLIC_URL=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=localpass
MINIO_BUCKET=hotel-avatars

ALLOWED_ORIGINS=http://localhost:5173
FRONTEND_URL=http://localhost:5173
EMAILS_ENABLED=false
EOF
```

> **Google OAuth** (optional): if you want Google login to work locally, add these two lines to `backend/.env`. The redirect URI is already registered in the project's Google Cloud Console:
> ```
> GOOGLE_CLIENT_ID=964778505369-hfsqu7rrbicfibc5ks6hs6umh63v1u9v.apps.googleusercontent.com
> GOOGLE_CLIENT_SECRET=<ask team lead>
> ```

### 4b. Create and activate a virtual environment

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 4c. Run database migrations

```bash
alembic upgrade head
```

You should see each migration applied ending with `Running upgrade ... -> 20260518_0009`.

### 4d. Seed default data (optional but recommended)

```bash
python3 -c "from app.utils.seed_data import seed; from app.core.database import SessionLocal; db = SessionLocal(); seed(db); db.close()" 2>/dev/null || echo "No seed function found — skip"
```

### 4e. Start the backend

```bash
uvicorn app.main:app --reload --port 8000
```

API is now live at http://localhost:8000  
Swagger docs: http://localhost:8000/api/v1/docs

---

## 5. Set up the frontend

### 5a. Create `frontend/react-app/.env.local`

This file tells Vite to call your local backend instead of the production server:

```bash
cat > frontend/react-app/.env.local << 'EOF'
VITE_API_URL=http://localhost:8000
EOF
```

### 5b. Install dependencies and start

```bash
cd ../frontend/react-app   # from backend/ go up then into frontend
npm install
npm run dev
```

Frontend is now live at http://localhost:5173

---

## 6. Default login credentials

| Role | Email | Password |
|---|---|---|
| Super Admin | admin@allstay.rest | Admin@2024 |
| Staff | sunnakh@allstay.rest | Admin@2024 |

If the seed step was skipped and these accounts don't exist, register a new guest account at http://localhost:5173/register. To promote it to admin, connect to Postgres and run:
```sql
UPDATE users SET role = 'super_admin' WHERE email = 'your@email.com';
```

Connect via: `psql postgresql://hotel_user:localpass@localhost:5432/hotel_system`

---

## 7. Service URLs at a glance

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000/api/v1 |
| Swagger docs | http://localhost:8000/api/v1/docs |
| MinIO console | http://localhost:9001 |

---

## 8. Stopping everything

```bash
# Stop the frontend and backend: Ctrl+C in each terminal

# Stop Docker infra
docker compose stop db redis minio

# Or tear down completely (removes volumes = wipes DB data)
docker compose down -v
```

---

## Troubleshooting

**`psycopg2` install fails on Apple Silicon**
```bash
brew install libpq
export LDFLAGS="-L/opt/homebrew/opt/libpq/lib"
export CPPFLAGS="-I/opt/homebrew/opt/libpq/include"
pip install psycopg2-binary
```

**`alembic upgrade head` fails with "connection refused"**  
Postgres container isn't ready yet. Wait a few seconds and retry. Check with `docker compose ps db`.

**Port 5432 already in use**  
You have a local Postgres running. Either stop it (`brew services stop postgresql`) or change the mapped port in docker-compose.yml: `"5433:5432"` and update `DATABASE_URL` to use port 5433.

**Port 6379 already in use**  
Same issue for Redis. Change to `"6380:6379"` and update `REDIS_URL` to `:localpass@localhost:6380`.

**Profile photo upload returns an error**  
MinIO bucket is created automatically on first upload. If you see a connection error, make sure the `minio` container is running: `docker compose ps minio`.

**Google login redirects to the wrong place**  
The redirect URI `http://localhost:5173/auth/callback` is already in `.env`. Make sure the Vite dev server is running on port 5173 (it uses 5173 by default).
