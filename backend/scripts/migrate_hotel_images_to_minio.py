"""
Migrate hotel_images and room_images to MinIO.

Two cases handled:
  1. Old MinIO URL with wrong host (e.g. http://localhost:9000/...) — rewrites
     the URL prefix in the DB; the object already lives in MinIO storage.
  2. Any external HTTP/HTTPS URL — downloads the image, uploads to MinIO,
     updates the DB row.

Run from /backend after setting MINIO_PUBLIC_URL in the environment:

    MINIO_PUBLIC_URL=https://allstay.rest/storage python scripts/migrate_hotel_images_to_minio.py

Idempotent: rows whose image_url already starts with the configured
MINIO_PUBLIC_URL are silently skipped.
"""
import sys
import os
import hashlib
import urllib.request
import urllib.error

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings
from app.core.database import SessionLocal
from app.models.hotel_image import HotelImage
from app.models.room_image import RoomImage
from app.services.storage import upload_image, _get_client

# Prefixes that indicate an image is already in MinIO but stored with a stale
# public URL (e.g. http://localhost:9000 or http://minio:9000).
_STALE_MINIO_PREFIXES = ("http://localhost:9000", "http://minio:9000")

_CONTENT_TYPES = {
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "png": "image/png",
    "webp": "image/webp",
    "gif": "image/gif",
}


def _content_type_from_url(url: str) -> str:
    ext = url.rsplit(".", 1)[-1].lower().split("?")[0]
    return _CONTENT_TYPES.get(ext, "image/jpeg")


def _object_exists(key: str) -> bool:
    try:
        _get_client().head_object(Bucket=settings.MINIO_BUCKET, Key=key)
        return True
    except Exception:
        return False


def _rewrite_stale_url(old_url: str) -> str | None:
    """Replace old MinIO host with current MINIO_PUBLIC_URL.

    Expects old_url like:
      http://localhost:9000/hotel-avatars/hotels/abc.jpg
    Returns:
      https://allstay.rest/storage/hotel-avatars/hotels/abc.jpg
    """
    for prefix in _STALE_MINIO_PREFIXES:
        if old_url.startswith(prefix):
            remainder = old_url[len(prefix):]  # /hotel-avatars/hotels/abc.jpg
            return f"{settings.MINIO_PUBLIC_URL}{remainder}"
    return None


def _download(url: str) -> bytes | None:
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "hms-migration/1.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            return resp.read()
    except urllib.error.URLError as exc:
        print(f"    WARN download failed ({exc}): {url}")
        return None


def migrate_table(db, model, prefix: str) -> tuple[int, int, int]:
    migrated = skipped = errors = 0
    rows = db.query(model).all()
    for row in rows:
        url: str = row.image_url or ""

        if not url:
            skipped += 1
            continue

        # Already correct
        if url.startswith(settings.MINIO_PUBLIC_URL):
            skipped += 1
            continue

        # Case 1: stale MinIO URL — object should already be in storage
        new_url = _rewrite_stale_url(url)
        if new_url is not None:
            # new_url = MINIO_PUBLIC_URL/BUCKET/prefix/filename
            # obj_key = prefix/filename (path inside the bucket)
            parts = new_url[len(settings.MINIO_PUBLIC_URL):].lstrip("/").split("/", 1)
            obj_key = parts[1] if len(parts) == 2 else None
            if obj_key and _object_exists(obj_key):
                row.image_url = new_url
                db.add(row)
                migrated += 1
                print(f"  URL row {row.id}: {url[:60]}… → {new_url[:60]}…")
            else:
                print(f"  WARN row {row.id}: stale MinIO URL but object missing, skipping: {url[:80]}")
                errors += 1
            continue

        # Case 2: external HTTP/HTTPS URL — download and re-upload
        if url.startswith("http://") or url.startswith("https://"):
            data = _download(url)
            if data is None:
                errors += 1
                continue
            # Use a deterministic filename based on the URL hash so re-runs are idempotent
            ext = url.rsplit(".", 1)[-1].lower().split("?")[0]
            if ext not in _CONTENT_TYPES:
                ext = "jpg"
            filename = hashlib.sha1(url.encode()).hexdigest()[:16] + f".{ext}"
            content_type = _content_type_from_url(url)
            try:
                new_url = upload_image(prefix, filename, data, content_type)
                row.image_url = new_url
                db.add(row)
                migrated += 1
                print(f"  OK  row {row.id}: {url[:60]}… → {new_url}")
            except Exception as exc:
                errors += 1
                print(f"  ERR row {row.id}: upload failed — {exc}")
            continue

        # Relative path or unknown format — cannot migrate automatically
        print(f"  SKIP row {row.id}: unrecognised URL format: {url[:80]}")
        skipped += 1

    return migrated, skipped, errors


def main() -> None:
    print(f"\n=== Hotel Image Migration ===")
    print(f"MINIO_PUBLIC_URL : {settings.MINIO_PUBLIC_URL}")
    print(f"MINIO_BUCKET     : {settings.MINIO_BUCKET}\n")

    db = SessionLocal()
    try:
        print("[1/2] hotel_images …")
        m, s, e = migrate_table(db, HotelImage, "hotels")
        print(f"      migrated={m}  skipped={s}  errors={e}\n")

        print("[2/2] room_images …")
        m2, s2, e2 = migrate_table(db, RoomImage, "rooms")
        print(f"      migrated={m2}  skipped={s2}  errors={e2}\n")

        db.commit()
        print("Committed.")
    except Exception as exc:
        db.rollback()
        print(f"\nFATAL: rolled back — {exc}")
        raise
    finally:
        db.close()

    total_errors = e + e2
    print(f"\nDone. total errors={total_errors}")
    if total_errors:
        sys.exit(1)


if __name__ == "__main__":
    main()
