"""
Meilisearch service for full-text hotel and room discovery.

Design split:
  - Meilisearch handles *discovery* — text query → candidate hotel/room IDs.
  - Postgres handles *availability* — date-range overlap filtering stays in the DB.
  The two compose: search_hotels(q) → hotel_ids → hydrate from DB for live data.

Index setup (run meilisearch_seed.py once on first deploy):
  hotels index  — filterable: city, country
  rooms index   — filterable: hotel_id, is_active, room_type_id
"""

import logging
from typing import Optional

import meilisearch

from app.core.config import settings

logger = logging.getLogger(__name__)

_client: meilisearch.Client | None = None


def get_meilisearch() -> meilisearch.Client:
    global _client
    if _client is None:
        _client = meilisearch.Client(settings.MEILISEARCH_URL, settings.MEILISEARCH_KEY or None)
    return _client


# ── Index helpers ─────────────────────────────────────────────────────────────

def _hotels_index() -> meilisearch.index.Index:
    return get_meilisearch().index("hotels")


def _rooms_index() -> meilisearch.index.Index:
    return get_meilisearch().index("rooms")


# ── Search ────────────────────────────────────────────────────────────────────

def search_hotels(query: str, city: Optional[str] = None, limit: int = 20) -> list[dict]:
    try:
        params: dict = {"limit": limit}
        if city:
            params["filter"] = f'city = "{city}"'
        result = _hotels_index().search(query, params)
        return result.get("hits", [])
    except Exception as exc:
        logger.warning("Meilisearch search_hotels failed (q=%r): %s", query, exc)
        return []


def search_rooms(query: str, hotel_id: Optional[int] = None, limit: int = 50) -> list[dict]:
    try:
        params: dict = {"limit": limit, "filter": "is_active = true"}
        if hotel_id:
            params["filter"] += f" AND hotel_id = {hotel_id}"
        result = _rooms_index().search(query, params)
        return result.get("hits", [])
    except Exception as exc:
        logger.warning("Meilisearch search_rooms failed (q=%r): %s", query, exc)
        return []


# ── Indexing ──────────────────────────────────────────────────────────────────

def index_hotel(hotel_dict: dict) -> None:
    try:
        _hotels_index().add_documents([hotel_dict])
    except Exception as exc:
        logger.warning("Meilisearch index_hotel failed id=%s: %s", hotel_dict.get("id"), exc)


def index_room(room_dict: dict) -> None:
    try:
        _rooms_index().add_documents([room_dict])
    except Exception as exc:
        logger.warning("Meilisearch index_room failed id=%s: %s", room_dict.get("id"), exc)


def delete_hotel_from_index(hotel_id: int) -> None:
    try:
        _hotels_index().delete_document(hotel_id)
    except Exception as exc:
        logger.warning("Meilisearch delete_hotel failed id=%d: %s", hotel_id, exc)
