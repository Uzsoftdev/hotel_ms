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

STACK_FILE=/opt/hotel/docker-stack.yml
ENV_FILE=/opt/hotel/.env

# Create a minimal .env if it doesn't exist
if [ ! -f "$ENV_FILE" ]; then
  cat > "$ENV_FILE" <<'ENVEOF'
APP_NAME="Azure Horizon Hotel API"
ENVIRONMENT=production
DEBUG=false
SECRET_KEY=azure_horizon_super_secret_key_32chars_2026
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
DATABASE_URL=postgresql://hotel_user:hotelpass123@164.92.193.226:5432/hotel_system
REDIS_URL=redis://:changeme@redis:6379/0
ALLOWED_ORIGINS=https://allstay.rest,https://www.allstay.rest
EMAILS_ENABLED=false
POSTGRES_USER=hotel_user
POSTGRES_PASSWORD=hotelpass123
POSTGRES_DB=hotel_system
REDIS_PASSWORD=changeme
MEILISEARCH_KEY=masterkey123
ENVEOF
fi

# Ensure frontend dist dir exists so nginx_static can mount it
mkdir -p /opt/hotel/frontend/react-app/dist

# Export all vars docker stack deploy needs for variable substitution
export DATABASE_URL="${DATABASE_URL:-postgresql://hotel_user:hotelpass123@164.92.193.226:5432/hotel_system}"
export REGISTRY="${REGISTRY:-ghcr.io/uzsoftdev}"
export IMAGE_TAG="${IMAGE_TAG:-latest}"
export DOMAIN="${DOMAIN:-allstay.rest}"
export ACME_EMAIL="${ACME_EMAIL:-sunnatakhmad@gmail.com}"

echo "Deploying with REGISTRY=$REGISTRY IMAGE_TAG=$IMAGE_TAG"

echo "$DEPLOY_TOKEN" | $DOCKER login ghcr.io -u "$DEPLOY_ACTOR" --password-stdin

$DOCKER stack deploy \
  --with-registry-auth \
  --prune \
  -c "$STACK_FILE" \
  hotel
