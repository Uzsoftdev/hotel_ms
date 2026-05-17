#!/bin/bash
# Run this on your DigitalOcean server: ssh root@167.99.138.191
# Then: bash diagnose.sh
#docker
echo "=== SWARM SERVICES ==="
docker service ls

echo ""
#backend
echo "=== BACKEND TASKS ==="
docker service ps hotel_backend --no-trunc

echo ""
echo "=== NGINX_STATIC TASKS ==="
docker service ps hotel_nginx_static --no-trunc

echo ""
#backend
echo "=== TRAEFIK TASKS ==="
docker service ps hotel_traefik --no-trunc

echo ""
#echo psrt 
echo "=== BACKEND LOGS (last 30 lines) ==="
docker service logs hotel_backend --tail 30 2>&1

echo ""
# front
echo "=== FRONTEND DIR ==="
ls -lah /opt/hms/frontend/ 2>/dev/null || echo "MISSING: /opt/hms/frontend does not exist"

echo ""
echo "=== ENV FILE ==="
ls -lah /opt/hotel/.env 2>/dev/null || echo "MISSING: /opt/hotel/.env does not exist"
