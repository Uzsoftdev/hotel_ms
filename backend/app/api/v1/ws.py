"""
WebSocket endpoint — real-time booking + notification push (R7).
"""

import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.services.websocket import ws_manager

router = APIRouter(tags=["WebSocket"])
logger = logging.getLogger(__name__)


@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int) -> None:
    """
    Guests and staff connect here to receive push updates without polling.

    Message format (server → client):
      {"event": "booking_update", "data": {"booking_id": 42, "status": "confirmed"}}
      {"event": "notification",   "data": {"title": "...", "message": "..."}}
      {"event": "ping",           "data": {}}
    """
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
