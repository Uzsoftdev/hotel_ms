"""
Public AI endpoints — no authentication required.

POST /api/v1/public/ai/chat       — conversational concierge
POST /api/v1/public/ai/recommend  — personalised room recommendations
"""

import json
import logging
from typing import Any, List, Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.core.config import settings
from app.dependencies import get_read_db
from app.models.hotel import Hotel
from app.models.room import Room

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai", tags=["Public AI"])

# ── Pydantic schemas ──────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: str   # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = None


class ChatResponse(BaseModel):
    reply: str


class RecommendRequest(BaseModel):
    occasion: str
    budget_max: int
    guests: int
    style: List[str] = []
    amenities: List[str] = []
    nights: Optional[int] = None


class RoomRecommendation(BaseModel):
    room_id: int
    hotel_name: str
    room_name: str
    price_per_night: float
    match_score: int
    match_reason: str
    style_tags: List[str]


class RecommendResponse(BaseModel):
    recommendations: List[RoomRecommendation]
    summary: str


# ── Helpers ───────────────────────────────────────────────────────────────────

def _get_anthropic_client():
    """Return an Anthropic client or None if the API key is not configured."""
    if not settings.ANTHROPIC_API_KEY:
        return None
    try:
        from anthropic import Anthropic  # type: ignore[import-untyped]
        return Anthropic(api_key=settings.ANTHROPIC_API_KEY)
    except Exception as exc:
        logger.warning("Failed to initialise Anthropic client: %s", exc)
        return None


def _fetch_portfolio_context(db: Session) -> str:
    """Build a short context string with current hotel/room stats."""
    try:
        hotel_count = db.query(func.count(Hotel.id)).scalar() or 0
        room_count = db.query(func.count(Room.id)).filter(Room.is_active == True).scalar() or 0
        min_price = db.query(func.min(Room.base_price)).filter(Room.is_active == True).scalar()
        max_price = db.query(func.max(Room.base_price)).filter(Room.is_active == True).scalar()
        min_p = float(min_price) if min_price is not None else 0
        max_p = float(max_price) if max_price is not None else 0
        return (
            f"Hotel portfolio: {hotel_count} hotels, {room_count} rooms available, "
            f"price range ${min_p:.0f}–${max_p:.0f}/night."
        )
    except Exception as exc:
        logger.warning("Could not fetch portfolio context: %s", exc)
        return "Hotel portfolio data currently unavailable."


def _query_rooms(db: Session, budget_max: int, guests: int, limit: int = 20):
    """Query active rooms within budget and capacity."""
    return (
        db.query(Room)
        .join(Hotel, Hotel.id == Room.hotel_id)
        .filter(
            Room.is_active == True,
            Room.base_price <= budget_max,
            Room.capacity >= guests,
        )
        .options(joinedload(Room.room_type), joinedload(Room.hotel))
        .limit(limit)
        .all()
    )


def _rooms_to_compact_list(rooms) -> list:
    """Convert Room ORM objects to a compact dict list for the prompt."""
    result = []
    for r in rooms:
        result.append({
            "id": r.id,
            "hotel_name": r.hotel.name if r.hotel else "Unknown Hotel",
            "room_type_name": r.room_type.name if r.room_type else "Standard",
            "price": float(r.base_price) if r.base_price is not None else 0.0,  # type: ignore[arg-type]
            "capacity": r.capacity or 1,
            "description": (r.description or "")[:200],
        })
    return result


def _fallback_recommendations(rooms, budget_max: int) -> list:
    """Return top 5 rooms ordered by price proximity to budget."""
    sorted_rooms = sorted(rooms, key=lambda r: abs((float(r.base_price) if r.base_price is not None else 0.0) - budget_max))[:5]  # type: ignore[arg-type]
    recs = []
    for i, r in enumerate(sorted_rooms):
        hotel_name = r.hotel.name if r.hotel else "Unknown Hotel"
        room_type_name = r.room_type.name if r.room_type else "Standard"
        recs.append({
            "room_id": r.id,
            "hotel_name": hotel_name,
            "room_name": f"{room_type_name} – Room {r.room_number or r.id}",
            "price_per_night": float(r.base_price) if r.base_price is not None else 0.0,  # type: ignore[arg-type]
            "match_score": max(60 - i * 5, 40),
            "match_reason": (
                f"This {room_type_name.lower()} room at {hotel_name} fits your budget "
                "and guest capacity requirements."
            ),
            "style_tags": [room_type_name, "Comfortable", "Value"],
        })
    return recs


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/chat", response_model=ChatResponse)
def chat(body: ChatRequest, db: Session = Depends(get_read_db)) -> Any:
    """Conversational concierge — no authentication required."""
    client = _get_anthropic_client()
    if client is None:
        return {"reply": "AI concierge is not configured yet. Please contact the hotel directly."}

    portfolio_note = _fetch_portfolio_context(db)

    system_prompt = (
        "You are allStay AI, a luxury hotel concierge assistant. "
        "You help guests find perfect rooms, answer questions about amenities, "
        "explain booking policies, suggest room styles based on occasions, "
        "and describe modern hospitality trends. "
        "Be warm, professional, and knowledgeable. "
        "Keep responses concise (under 200 words). "
        "When recommending rooms, mention style (minimalist, boutique, luxury, ocean-view etc), "
        "suitability (romantic, business, family), and price range context.\n\n"
        f"Current data: {portfolio_note}"
    )

    # Trim history to last 6 messages
    history = body.history or []
    trimmed = history[-6:] if len(history) > 6 else history

    messages = [{"role": m.role, "content": m.content} for m in trimmed]
    messages.append({"role": "user", "content": body.message})

    try:
        response = client.messages.create(
            model="claude-sonnet-4-5",
            max_tokens=512,
            system=system_prompt,
            messages=messages,
        )
        return {"reply": response.content[0].text}
    except Exception as exc:
        logger.error("Anthropic chat call failed: %s", exc)
        return {
            "reply": (
                "I'm having trouble connecting right now. "
                "Please try again in a moment or contact the hotel directly."
            )
        }


@router.post("/recommend", response_model=RecommendResponse)
def recommend(body: RecommendRequest, db: Session = Depends(get_read_db)) -> Any:
    """AI-powered room recommendation — no authentication required."""

    # ── 1. Query rooms ─────────────────────────────────────────────────────────
    rooms = _query_rooms(db, body.budget_max, body.guests)

    # Relax budget by 30% and retry if no results
    if not rooms:
        relaxed_budget = int(body.budget_max * 1.3)
        rooms = _query_rooms(db, relaxed_budget, body.guests)

    if not rooms:
        return {
            "recommendations": [],
            "summary": (
                "No rooms currently match your criteria. "
                "Consider adjusting your budget or guest count."
            ),
        }

    # Build a room lookup dict for hydration
    room_map = {r.id: r for r in rooms}

    # ── 2. Try Claude ──────────────────────────────────────────────────────────
    client = _get_anthropic_client()

    if client is None:
        # Fallback: sort by price proximity, generate tags from room_type name
        raw_recs = _fallback_recommendations(rooms, body.budget_max)
        summary = (
            f"Based on your preferences for a {body.occasion} trip with {body.guests} guest(s), "
            f"here are our closest matches within a ${body.budget_max}/night budget. "
            "Contact us for personalised advice."
        )
        return {"recommendations": raw_recs, "summary": summary}

    room_list = _rooms_to_compact_list(rooms)

    user_message = (
        f"Given these rooms: {json.dumps(room_list)} "
        f"and these guest preferences: occasion={body.occasion}, "
        f"budget_max={body.budget_max}/night, guests={body.guests}, "
        f"style_preferences={body.style}, desired_amenities={body.amenities}, "
        f"nights={body.nights}. "
        "Rank the top 5 most suitable rooms. "
        "For each give: room_id, match_score (0-100), match_reason (1-2 sentences), "
        "style_tags (list of 2-4 descriptive tags). "
        "Also give a 'summary' field (2-3 sentences of overall advice). "
        'Return JSON: {"recommendations": [...], "summary": "..."}'
    )

    try:
        response = client.messages.create(
            model="claude-sonnet-4-5",
            max_tokens=1024,
            system=(
                "You are a hotel room recommendation engine. "
                "Return ONLY valid JSON, no markdown, no explanation outside the JSON."
            ),
            messages=[{"role": "user", "content": user_message}],
        )
        raw_text = response.content[0].text.strip()

        # Strip markdown code fences if present
        if raw_text.startswith("```"):
            raw_text = raw_text.split("```")[1]
            if raw_text.startswith("json"):
                raw_text = raw_text[4:]
            raw_text = raw_text.strip()

        parsed = json.loads(raw_text)
        ai_recs = parsed.get("recommendations", [])
        summary = parsed.get("summary", "")

        # ── 3. Hydrate with DB data ────────────────────────────────────────────
        hydrated = []
        for rec in ai_recs[:5]:
            rid = rec.get("room_id")
            room = room_map.get(rid)
            if room is None:
                continue
            hotel_name = room.hotel.name if room.hotel else "Unknown Hotel"
            room_type_name = room.room_type.name if room.room_type else "Standard"
            hydrated.append({
                "room_id": rid,
                "hotel_name": hotel_name,
                "room_name": f"{room_type_name} – Room {room.room_number or rid}",
                "price_per_night": float(room.base_price) if room.base_price is not None else 0.0,  # type: ignore[arg-type]
                "match_score": int(rec.get("match_score", 70)),
                "match_reason": rec.get("match_reason", ""),
                "style_tags": rec.get("style_tags", [room_type_name]),
            })

        return {"recommendations": hydrated, "summary": summary}

    except (json.JSONDecodeError, KeyError, Exception) as exc:
        logger.error("Recommendation AI call or parsing failed: %s", exc)
        # Fallback: price-proximity sort
        raw_recs = _fallback_recommendations(rooms, body.budget_max)
        return {
            "recommendations": raw_recs,
            "summary": (
                f"Here are our top picks for your {body.occasion} stay with {body.guests} guest(s). "
                "All options are within or close to your budget range."
            ),
        }
