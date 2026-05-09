#!/bin/bash
set -e

DOCKER=/usr/bin/docker
STACK_FILE=/opt/hotel/docker-stack.yml

echo "$DEPLOY_TOKEN" | $DOCKER login ghcr.io -u "$DEPLOY_ACTOR" --password-stdin

$DOCKER stack deploy \
  --with-registry-auth \
  --prune \
  -c "$STACK_FILE" \
  hotel
