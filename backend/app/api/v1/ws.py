"""
WebSocket endpoint — real-time booking + notification push (R7).
"""

import logging
from typing import Optional

from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect

from app.core.security import decode_token
from app.services.token_blacklist import is_blacklisted
from app.services.websocket import ws_manager

router = APIRouter(tags=["WebSocket"])
logger = logging.getLogger(__name__)


@router.websocket("/ws/{user_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    user_id: int,
    token: Optional[str] = Query(default=None),
) -> None:
    """
    Guests and staff connect here to receive push updates without polling.

    Authentication: pass a valid JWT access token as a query parameter:
      ws://host/ws/{user_id}?token=<access_token>

    Message format (server → client):
      {"event": "booking_update", "data": {"booking_id": 42, "status": "confirmed"}}
      {"event": "notification",   "data": {"title": "...", "message": "..."}}
      {"event": "ping",           "data": {}}
    """
    # ── Authentication ────────────────────────────────────────────────────────
    if not token:
        await websocket.close(code=1008, reason="Missing authentication token")
        return

    try:
        payload = decode_token(token)
        if payload.get("type") != "access":
            await websocket.close(code=1008, reason="Invalid token type")
            return
        token_user_id = payload.get("user_id")
        jti = payload.get("jti")
        if token_user_id is None or int(token_user_id) != user_id:
            await websocket.close(code=1008, reason="Token does not match user")
            return
        if jti and is_blacklisted(jti):
            await websocket.close(code=1008, reason="Token has been revoked")
            return
    except Exception:
        await websocket.close(code=1008, reason="Invalid or expired token")
        return

    # ── Connection ────────────────────────────────────────────────────────────
    await ws_manager.connect(user_id, websocket)
    try:
        await websocket.send_json({"event": "connected", "data": {"user_id": user_id}})
        while True:
            # Keep the connection alive; client can send pings
            text = await websocket.receive_text()
            if text == "ping":
                await websocket.send_json({"event": "pong", "data": {}})
    except WebSocketDisconnect:
        ws_manager.disconnect(user_id, websocket)
        logger.info("WS disconnected user=%s", user_id)

