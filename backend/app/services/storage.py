"""
MinIO S3-compatible object storage for user avatars (Phase 3).

Replaces disk-based /static/avatars/ which breaks under multi-replica
deployments — a file written on replica-1 is invisible to replica-2.
"""
import io
import json
import logging

import boto3
from botocore.exceptions import ClientError

from app.core.config import settings

logger = logging.getLogger(__name__)

_client = None


def _get_client():
    global _client
    if _client is None:
        _client = boto3.client(
            "s3",
            endpoint_url=settings.MINIO_ENDPOINT,
            aws_access_key_id=settings.MINIO_ACCESS_KEY,
            aws_secret_access_key=settings.MINIO_SECRET_KEY,
            region_name="us-east-1",
        )
        _ensure_bucket(_client)
    return _client


def _ensure_bucket(client) -> None:
    try:
        client.head_bucket(Bucket=settings.MINIO_BUCKET)
    except ClientError:
        client.create_bucket(Bucket=settings.MINIO_BUCKET)
        # Make objects publicly readable (avatars are not sensitive)
        policy = json.dumps({
            "Version": "2012-10-17",
            "Statement": [{
                "Effect": "Allow",
                "Principal": "*",
                "Action": "s3:GetObject",
                "Resource": f"arn:aws:s3:::{settings.MINIO_BUCKET}/*",
            }],
        })
        client.put_bucket_policy(Bucket=settings.MINIO_BUCKET, Policy=policy)


def upload_avatar(filename: str, data: bytes, content_type: str) -> str:
    """Upload avatar bytes to MinIO; return the public URL."""
    client = _get_client()
    key = f"avatars/{filename}"
    client.put_object(
        Bucket=settings.MINIO_BUCKET,
        Key=key,
        Body=io.BytesIO(data),
        ContentType=content_type,
        ContentLength=len(data),
    )
    return f"{settings.MINIO_PUBLIC_URL}/{settings.MINIO_BUCKET}/{key}"


def delete_avatar(photo_url: str) -> None:
    """Delete avatar from MinIO given its full public URL. Silently ignores misses."""
    if not photo_url or settings.MINIO_BUCKET not in photo_url:
        return
    try:
        # Extract key: .../bucket/avatars/filename → avatars/filename
        key = "/".join(photo_url.split(f"/{settings.MINIO_BUCKET}/")[1:])
        _get_client().delete_object(Bucket=settings.MINIO_BUCKET, Key=key)
    except Exception as exc:
        logger.warning("delete_avatar failed: %s", exc)
