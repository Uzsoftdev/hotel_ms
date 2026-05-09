"""
Data migration: pull all data from the source DB into our local DB.

Source: postgresql://admin_misha:secret123@157.230.125.85:5432/hotel_system
Target: postgresql://hotel_user:hotelpass123@localhost:5432/hotel_system

Run from /backend:
    python scripts/migrate_from_source.py
"""

import psycopg2
from psycopg2.extras import execute_values

SOURCE_DSN = "postgresql://admin_misha:secret123@157.230.125.85:5432/hotel_system"
TARGET_DSN = "postgresql://hotel_user:hotelpass123@localhost:5432/hotel_system"


def connect(dsn, label):
    try:
        conn = psycopg2.connect(dsn)
        conn.autocommit = False
        print(f"  ✓ Connected to {label}")
        return conn
    except Exception as e:
        raise SystemExit(f"  ✗ Could not connect to {label}: {e}")


def ensure_amenity_tables(cur):
    """Create amenities + room_amenities if they don't exist yet."""
    cur.execute("""
        CREATE TABLE IF NOT EXISTS amenities (
            id      SERIAL PRIMARY KEY,
            name    VARCHAR NOT NULL UNIQUE
        );
        CREATE INDEX IF NOT EXISTS ix_amenities_id ON amenities(id);

        CREATE TABLE IF NOT EXISTS room_amenities (
            room_id    INTEGER NOT NULL REFERENCES rooms(id),
            amenity_id INTEGER NOT NULL REFERENCES amenities(id),
            PRIMARY KEY (room_id, amenity_id)
        );
    """)
    print("  ✓ amenities / room_amenities tables ready")


def clear_target(cur):
    """
    Wipe all imported data in strict FK order (no CASCADE) so users are preserved.
    """
    cur.execute("""
        TRUNCATE TABLE blackout_dates         RESTART IDENTITY;
        TRUNCATE TABLE pricing_rules          RESTART IDENTITY;
        TRUNCATE TABLE hotel_facilities       RESTART IDENTITY;
        TRUNCATE TABLE room_amenities         RESTART IDENTITY;
        TRUNCATE TABLE room_images            RESTART IDENTITY;
        TRUNCATE TABLE hotel_images           RESTART IDENTITY;
        -- detach users from hotels so we can truncate hotels safely
        UPDATE users SET hotel_id = NULL;
        TRUNCATE TABLE bookings               RESTART IDENTITY;
        TRUNCATE TABLE wishlist_items         RESTART IDENTITY;
        TRUNCATE TABLE reviews                RESTART IDENTITY;
        TRUNCATE TABLE rooms                  RESTART IDENTITY;
        TRUNCATE TABLE room_types             RESTART IDENTITY;
        TRUNCATE TABLE amenities              RESTART IDENTITY;
        TRUNCATE TABLE facilities             RESTART IDENTITY;
        TRUNCATE TABLE hotels                 RESTART IDENTITY;
    """)
    print("  ✓ Target tables cleared (users preserved)")


def fetch_all(cur, table, columns):
    cur.execute(f"SELECT {', '.join(columns)} FROM {table} ORDER BY id")
    return cur.fetchall()


def fetch_all_no_id(cur, table, columns):
    cur.execute(f"SELECT {', '.join(columns)} FROM {table}")
    return cur.fetchall()


def copy_table(src_cur, tgt_cur, table, columns, page_size=2000):
    rows = fetch_all(src_cur, table, columns)
    if not rows:
        print(f"  – {table}: 0 rows (skipped)")
        return
    col_str = ", ".join(columns)
    sql = f"INSERT INTO {table} ({col_str}) VALUES %s ON CONFLICT DO NOTHING"
    execute_values(tgt_cur, sql, rows, page_size=page_size)
    # Reset the sequence so future INSERTs don't collide
    tgt_cur.execute(f"""
        SELECT setval(pg_get_serial_sequence('{table}', 'id'),
                      COALESCE(MAX(id), 1)) FROM {table};
    """)
    print(f"  ✓ {table}: {len(rows):,} rows")


def copy_junction(src_cur, tgt_cur, table, columns, page_size=2000):
    """Copy a table with composite PK (no id column)."""
    src_cur.execute(f"SELECT {', '.join(columns)} FROM {table}")
    rows = src_cur.fetchall()
    if not rows:
        print(f"  – {table}: 0 rows (skipped)")
        return
    col_str = ", ".join(columns)
    sql = f"INSERT INTO {table} ({col_str}) VALUES %s ON CONFLICT DO NOTHING"
    execute_values(tgt_cur, sql, rows, page_size=page_size)
    print(f"  ✓ {table}: {len(rows):,} rows")


def main():
    print("\n=== Hotel DB Migration ===\n")

    print("Connecting …")
    src = connect(SOURCE_DSN, "source (157.230.125.85)")
    tgt = connect(TARGET_DSN, "target (localhost)")

    src_cur = src.cursor()
    tgt_cur = tgt.cursor()

    try:
        print("\n[1/3] Preparing target …")
        ensure_amenity_tables(tgt_cur)
        clear_target(tgt_cur)

        print("\n[2/3] Copying tables …")

        # Independent tables first
        copy_table(src_cur, tgt_cur, "hotels", [
            "id", "name", "description", "address", "city", "country",
            "country_code", "phone", "email", "latitude", "longitude",
            "rating", "created_at",
        ])

        copy_table(src_cur, tgt_cur, "facilities", ["id", "name"])
        copy_table(src_cur, tgt_cur, "amenities",  ["id", "name"])

        # Depends on hotels
        copy_table(src_cur, tgt_cur, "room_types", [
            "id", "hotel_id", "name", "description",
        ])

        # Depends on hotels + room_types
        copy_table(src_cur, tgt_cur, "rooms", [
            "id", "hotel_id", "room_type_id", "room_number",
            "capacity", "base_price", "description", "is_active",
        ])

        # Depends on hotels
        copy_table(src_cur, tgt_cur, "hotel_images", [
            "id", "hotel_id", "image_url", "is_primary",
        ])

        # Depends on rooms
        copy_table(src_cur, tgt_cur, "room_images", [
            "id", "room_id", "image_url", "is_primary",
        ])

        # Junction tables
        copy_junction(src_cur, tgt_cur, "hotel_facilities", ["hotel_id", "facility_id"])
        copy_junction(src_cur, tgt_cur, "room_amenities",   ["room_id",  "amenity_id"])

        # Depends on hotels + room_types
        copy_table(src_cur, tgt_cur, "pricing_rules", [
            "id", "hotel_id", "room_type_id", "start_date", "end_date",
            "price", "multiplier", "priority", "created_at",
        ])

        # Depends on hotels + rooms (optional)
        copy_table(src_cur, tgt_cur, "blackout_dates", [
            "id", "hotel_id", "room_id", "date", "reason",
        ])

        print("\n[3/3] Committing …")
        tgt.commit()
        print("  ✓ All changes committed\n")

        # Final counts
        print("=== Row counts in target ===")
        for t in ["hotels", "room_types", "rooms", "facilities", "amenities",
                  "hotel_images", "room_images", "hotel_facilities",
                  "room_amenities", "pricing_rules", "blackout_dates", "users"]:
            tgt_cur.execute(f"SELECT count(*) FROM {t}")
            n = tgt_cur.fetchone()[0]
            print(f"  {t:<20} {n:>7,}")

    except Exception as e:
        tgt.rollback()
        print(f"\n✗ Migration failed, rolled back: {e}")
        raise
    finally:
        src.close()
        tgt.close()

    print("\nDone.\n")


if __name__ == "__main__":
    main()
