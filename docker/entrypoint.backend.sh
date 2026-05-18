#!/bin/sh
set -e

echo "Running database migrations..."
alembic upgrade head
echo "Migrations done."

exec gunicorn app.main:app \
    --worker-class uvicorn.workers.UvicornWorker \
    --workers 2 \
    --bind 0.0.0.0:8000 \
    --max-requests 1000 \
    --max-requests-jitter 100 \
    --timeout 120
