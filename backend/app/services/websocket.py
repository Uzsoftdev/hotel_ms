"""
WebSocket connection manager with Redis Pub/Sub cross-replica broadcast (Phase 2.2).

Problem solved:
  The old implementation kept connections in an in-process dict. With two backend
  replicas, a notification triggered on backend1 would never reach a client
  connected to backend2 — the message was simply lost.

Solution:
  Every send_to_user() and broadcast() call publishes to a Redis channel
  ("ws:events"). A subscriber task running in each replica listens on that
  channel and fans out to locally-connected WebSocket clients.

  backend1 publishes → Redis → backend1 subscriber + backend2 subscriber
                                      ↓                       ↓
                              local clients              local clients

The subscriber is started once in the FastAPI lifespan event (main.py).
"""

import asyncio
import json
import logging
from collections import defaultdict

import redis.asyncio as aioredis
from fastapi import WebSocket

from app.core.config import settings

logger = logging.getLogger(__name__)

_CHANNEL = "ws:events"


class ConnectionManager:
    def __init__(self) -> None:
        # user_id → list of active WebSocket connections on THIS replica
        self._connections: dict[int, list[WebSocket]] = defaultdict(list)
        self._redis: aioredis.Redis | None = None
        # Keep a reference to prevent garbage-collection of the task
        self._subscriber_task: asyncio.Task | None = None

    # ── Lifecycle ─────────────────────────────────────────────────────────────

    async def start_subscriber(self) -> None:
        """Called once at startup — opens a Pub/Sub listener on Redis."""
        import os
        if os.environ.get("TESTING", "").lower() in ("1", "true"):
            logger.info("WS Pub/Sub subscriber disabled in test mode")
            return
        self._redis = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
        pubsub = self._redis.pubsub()
        await pubsub.subscribe(_CHANNEL)
        self._subscriber_task = asyncio.create_task(self._listen(pubsub))
        logger.info("WS Pub/Sub subscriber started on channel '%s'", _CHANNEL)

    async def _listen(self, pubsub: aioredis.client.PubSub) -> None:
        try:
            async for message in pubsub.listen():
                if message["type"] != "message":
                    continue
                try:
                    envelope = json.loads(message["data"])
                    user_id = envelope.get("user_id")
                    event = envelope.get("event", "")
                    data = envelope.get("data", {})
                    if user_id is not None:
                        await self._local_send(int(user_id), event, data)
                    else:
                        await self._local_broadcast(event, data)
                except Exception as exc:
                    logger.warning("WS listener: failed to process message: %s", exc)
        except Exception as exc:
            logger.error("WS Pub/Sub listener crashed: %s", exc, exc_info=True)

    # ── Local delivery (this replica only) ────────────────────────────────────

    async def _local_send(self, user_id: int, event: str, data: dict) -> None:
        payload = json.dumps({"event": event, "data": data})
        dead: list[WebSocket] = []
        for ws in list(self._connections.get(user_id, [])):
            try:
                await ws.send_text(payload)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self._remove(user_id, ws)

    async def _local_broadcast(self, event: str, data: dict) -> None:
        payload = json.dumps({"event": event, "data": data})
        for user_id, conns in list(self._connections.items()):
            dead: list[WebSocket] = []
            for ws in list(conns):
                try:
                    await ws.send_text(payload)
                except Exception:
                    dead.append(ws)
            for ws in dead:
                self._remove(user_id, ws)

    # ── Public API (publishes to Redis → all replicas fan out) ────────────────

    async def send_to_user(self, user_id: int, event: str, data: dict) -> None:
        """Push an event to all connections for a user across every replica."""
        if self._redis is None:
            # Fallback: deliver locally only (e.g. single-replica or test mode)
            await self._local_send(user_id, event, data)
            return
        envelope = json.dumps({"user_id": user_id, "event": event, "data": data})
        try:
            await self._redis.publish(_CHANNEL, envelope)
        except Exception as exc:
            logger.warning("WS publish failed, falling back to local send: %s", exc)
            await self._local_send(user_id, event, data)

    async def broadcast(self, event: str, data: dict) -> None:
        """Push an event to all connected users across every replica."""
        if self._redis is None:
            await self._local_broadcast(event, data)
            return
        envelope = json.dumps({"user_id": None, "event": event, "data": data})
        try:
            await self._redis.publish(_CHANNEL, envelope)
        except Exception as exc:
            logger.warning("WS broadcast failed, falling back to local: %s", exc)
            await self._local_broadcast(event, data)

    # ── Connection lifecycle ───────────────────────────────────────────────────

    async def connect(self, user_id: int, websocket: WebSocket) -> None:
        await websocket.accept()
        self._connections[user_id].append(websocket)
        logger.info("WS connect user=%s total=%s", user_id, len(self._connections[user_id]))

    def disconnect(self, user_id: int, websocket: WebSocket) -> None:
        self._remove(user_id, websocket)
        logger.info("WS disconnect user=%s", user_id)

    def _remove(self, user_id: int, websocket: WebSocket) -> None:
        conns = self._connections.get(user_id, [])
        if websocket in conns:
            conns.remove(websocket)
        if not conns:
            self._connections.pop(user_id, None)

    @property
    def connected_users(self) -> int:
        return len(self._connections)


ws_manager = ConnectionManager()
