"""
Token blacklist backed by Redis.

On logout the JTI (unique token ID) is stored with TTL = remaining token
lifetime so the key expires exactly when the token would have expired anyway —
no unbounded growth.

Tokens issued before the jti field was added have no jti claim; those pass
through the blacklist check transparently (the check is a no-op for them).
"""

import logging
from datetime import datetime, timezone

from app.services.cache import get_redis

logger = logging.getLogger(__name__)

_PREFIX = "bl:jti:"


def blacklist_token(jti: str, exp: int) -> None:
    """Store a token's jti in Redis until the token would naturally expire."""
    now = int(datetime.now(timezone.utc).timestamp())
    ttl = max(exp - now, 1)
    try:
        get_redis().setex(f"{_PREFIX}{jti}", ttl, "1")
    except Exception as exc:
        logger.warning("token_blacklist: failed to store jti=%s: %s", jti, exc)


def is_blacklisted(jti: str) -> bool:
    """Return True if this jti has been revoked."""
    try:
        return get_redis().exists(f"{_PREFIX}{jti}") == 1
    except Exception as exc:
        logger.warning("token_blacklist: failed to check jti=%s: %s — allowing through", jti, exc)
        return False   # fail open — prefer availability over locking users out
