"""
One-time script: seed Meilisearch indices from Postgres.

Run once after first deploying Meilisearch, or any time the index needs a full
rebuild (e.g. after wiping the meilisearch_data volume).

Usage:
    cd backend
    python scripts/meilisearch_seed.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings
from app.core.database import SessionLocal
from app.models.hotel import Hotel
from app.models.room import Room
import meilisearch


def main() -> None:
    client = meilisearch.Client(settings.MEILISEARCH_URL, settings.MEILISEARCH_KEY or None)

    # ── Configure hotels index ───────────────────────────────────────────────
    hotels_index = client.index("hotels")
    hotels_index.update_filterable_attributes(["city", "country", "country_code"])
    hotels_index.update_sortable_attributes(["rating", "name"])
    hotels_index.update_searchable_attributes(["name", "description", "city", "country", "address"])
    print("Hotels index configured")

    # ── Configure rooms index ────────────────────────────────────────────────
    rooms_index = client.index("rooms")
    rooms_index.update_filterable_attributes(["hotel_id", "is_active", "room_type_id"])
    rooms_index.update_sortable_attributes(["base_price", "capacity"])
    rooms_index.update_searchable_attributes(["room_number", "description"])
    print("Rooms index configured")

    db = SessionLocal()
    try:
        # ── Seed hotels ──────────────────────────────────────────────────────
        hotels = db.query(Hotel).all()
        hotel_docs = [
            {
                "id": h.id,
                "name": h.name,
                "description": h.description or "",
                "city": h.city or "",
                "country": h.country or "",
                "country_code": h.country_code or "",
                "address": h.address or "",
                "rating": float(h.rating or 0),
            }
            for h in hotels
        ]
        if hotel_docs:
            hotels_index.add_documents(hotel_docs)
            print(f"Indexed {len(hotel_docs)} hotels")

        # ── Seed rooms ───────────────────────────────────────────────────────
        rooms = db.query(Room).all()
        room_docs = [
            {
                "id": r.id,
                "hotel_id": r.hotel_id,
                "room_type_id": r.room_type_id,
                "room_number": r.room_number or "",
                "capacity": r.capacity or 0,
                "base_price": float(r.base_price or 0),
                "description": r.description or "",
                "is_active": r.is_active,
            }
            for r in rooms
        ]
        if room_docs:
            rooms_index.add_documents(room_docs)
            print(f"Indexed {len(room_docs)} rooms")

    finally:
        db.close()

    print("Meilisearch seed complete. Index updates are async — check status with:")
    print(f"  curl {settings.MEILISEARCH_URL}/tasks")


if __name__ == "__main__":
    main()
