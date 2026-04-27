"""
WebSocket connection manager (R7 — Additional API Style).

Why WebSockets and not polling?
  Booking status transitions (pending → confirmed, confirmed → checked_in) are
  low-frequency but latency-sensitive from the guest's perspective.  Polling would
  require the client to hammer GET /bookings every few seconds; WebSockets push the
  update the instant the admin confirms, eliminating both wasted requests and the
  polling delay.  This maps directly to the "live updates" use-case described in
  the spec for R7.

Protocol:
  - Client connects to ws://host/ws/{user_id}
  - Server pushes JSON messages:  {"event": "booking_update", "data": {...}}
  - Server also pushes:           {"event": "notification", "data": {...}}
"""

import json
import logging
from collections import defaultdict

from fastapi import WebSocket

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manages per-user WebSocket connections (one user may have multiple tabs)."""

    def __init__(self) -> None:
        # user_id → list of active WebSocket connections
        self._connections: dict[int, list[WebSocket]] = defaultdict(list)

    async def connect(self, user_id: int, websocket: WebSocket) -> None:
        await websocket.accept()
        self._connections[user_id].append(websocket)
        logger.info("WS connect  user=%s  total=%s", user_id, len(self._connections[user_id]))

    def disconnect(self, user_id: int, websocket: WebSocket) -> None:
        conns = self._connections.get(user_id, [])
        if websocket in conns:
            conns.remove(websocket)
        if not conns:
            self._connections.pop(user_id, None)
        logger.info("WS disconnect user=%s", user_id)

    async def send_to_user(self, user_id: int, event: str, data: dict) -> None:
        """Push a JSON event to all open connections for a user."""
        payload = json.dumps({"event": event, "data": data})
        dead: list[WebSocket] = []
        for ws in list(self._connections.get(user_id, [])):
            try:
                await ws.send_text(payload)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(user_id, ws)

    async def broadcast(self, event: str, data: dict) -> None:
        """Push an event to all connected users (admin broadcast use-case)."""
        payload = json.dumps({"event": event, "data": data})
        for user_id, conns in list(self._connections.items()):
            dead: list[WebSocket] = []
            for ws in list(conns):
                try:
                    await ws.send_text(payload)
                except Exception:
                    dead.append(ws)
            for ws in dead:
                self.disconnect(user_id, ws)

    @property
    def connected_users(self) -> int:
        return len(self._connections)


# Singleton — imported wherever a push is needed.
ws_manager = ConnectionManager()
