"""
One-time migration: copy existing disk avatars from /static/avatars/ to MinIO
and update the photo_url column in Postgres to the new MinIO URL.

Run ONCE after deploying MinIO for the first time, then remove the static/avatars
volume mount from docker-compose (or keep it read-only for the migration window).

Usage:
    cd backend
    python scripts/migrate_avatars_to_minio.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings
from app.core.database import SessionLocal
from app.models.user import User
from app.services.storage import upload_avatar

AVATAR_DIR = "static/avatars"


def main() -> None:
    db = SessionLocal()
    migrated = skipped = errors = 0
    try:
        users = db.query(User).filter(User.photo_url.isnot(None)).all()
        for user in users:
            old_url: str = user.photo_url
            # Skip already-migrated URLs (they point to MinIO)
            if settings.MINIO_PUBLIC_URL in old_url:
                skipped += 1
                continue

            # Derive local path: /static/avatars/filename → static/avatars/filename
            relative = old_url.lstrip("/")
            local_path = os.path.join(os.getcwd(), relative)
            if not os.path.isfile(local_path):
                print(f"  SKIP user {user.id}: file not found at {local_path}")
                skipped += 1
                continue

            filename = os.path.basename(local_path)
            ext = filename.rsplit(".", 1)[-1].lower()
            content_type = {
                "jpg": "image/jpeg",
                "jpeg": "image/jpeg",
                "png": "image/png",
                "webp": "image/webp",
            }.get(ext, "image/jpeg")

            try:
                with open(local_path, "rb") as f:
                    data = f.read()
                new_url = upload_avatar(filename, data, content_type)
                user.photo_url = new_url
                db.add(user)
                migrated += 1
                print(f"  OK  user {user.id}: {old_url} → {new_url}")
            except Exception as exc:
                errors += 1
                print(f"  ERR user {user.id}: {exc}")

        db.commit()
    finally:
        db.close()

    print(f"\nDone. migrated={migrated}  skipped={skipped}  errors={errors}")
    if errors:
        sys.exit(1)


if __name__ == "__main__":
    main()
