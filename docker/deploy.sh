#!/bin/bash
set -e

export PATH="/usr/local/bin:/usr/bin:/bin:/snap/bin:$PATH"

DOCKER=$(command -v docker 2>/dev/null)
if [ -z "$DOCKER" ]; then
  echo "ERROR: docker binary not found in PATH ($PATH)" && exit 1
fi

# Use sudo -E if not already root (-E preserves env vars like REGISTRY, IMAGE_TAG)
if [ "$(id -u)" != "0" ]; then
  DOCKER="sudo -E $DOCKER"
fi
#docker ysml 
STACK_FILE=/opt/hotel/docker-stack.yml
ENV_FILE=/opt/hotel/.env

# Create a minimal .env if it doesn't exist
if [ ! -f "$ENV_FILE" ]; then
  echo "ERROR: $ENV_FILE not found. Copy .env.example to $ENV_FILE and fill in all secrets before deploying."
  echo "       cp /opt/hotel/docker/env.example $ENV_FILE"
  exit 1
fi

# Ensure frontend dist dir exists so nginx_static can mount it
mkdir -p /opt/hms/frontend

# Hand port 80 and 443 to Traefik — system nginx would block ACME HTTP-01 challenge
sudo systemctl stop nginx  || true
sudo systemctl disable nginx || true

# Export all vars docker stack deploy needs for variable substitution
export DATABASE_URL="${DATABASE_URL}"
export REGISTRY="${REGISTRY:-ghcr.io/uzsoftdev}"
export IMAGE_TAG="${IMAGE_TAG:-latest}"
export DOMAIN="${DOMAIN:-allstay.rest}"
export ACME_EMAIL="${ACME_EMAIL:-sunnatakhmad@gmail.com}"

echo "Deploying with REGISTRY=$REGISTRY IMAGE_TAG=$IMAGE_TAG"

echo "$DEPLOY_TOKEN" | $DOCKER login ghcr.io -u "$DEPLOY_ACTOR" --password-stdin

# Run Alembic migrations before rolling update
echo "Running database migrations..."
BACKEND_CONTAINER=$(sudo docker ps -qf "name=hotel_backend" | head -1)
if [ -n "$BACKEND_CONTAINER" ]; then
  sudo docker exec "$BACKEND_CONTAINER" alembic upgrade head && echo "Migrations OK" || echo "Migration warning (may be first deploy)"
fi

# Retry on "update out of sequence" race condition (Swarm concurrent update lock)
for attempt in 1 2 3; do
  if $DOCKER stack deploy \
      --with-registry-auth \
      --detach=true \
      --prune \
      -c "$STACK_FILE" \
      hotel; then
    break
  fi
  if [ "$attempt" -lt 3 ]; then
    echo "Deploy attempt $attempt failed, retrying in 10s…"
    sleep 10
  else
    echo "Deploy failed after 3 attempts." && exit 1
  fi
done
