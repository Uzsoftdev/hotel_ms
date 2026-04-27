"""
Token-Bucket Rate Limiter — implemented from scratch.

Design (from DDIA Chapter 12 / System Design Interview Vol.1 Chapter 4):
  - Each (client_ip, endpoint) pair gets its own bucket stored in Redis as a hash.
  - A Lua script runs atomically on Redis: refills tokens based on elapsed wall-clock
    time, then tries to consume one token.  Because Lua scripts are single-threaded
    inside Redis, no race condition is possible — identical to the CAS-loop approach
    described in Kleppmann §Leaderless Replication but cheaper.

Integration:
  - Replaces SlowAPI.  FastAPI middleware calls `limiter.is_allowed()` before the
    handler; if it returns False the middleware short-circuits with HTTP 429.
  - The Redis client is the same instance used by the availability cache, so no extra
    connection overhead.

Trade-offs documented for the report:
  - Pros: atomic, no double-counting across replicas behind Nginx, O(1) per request.
  - Cons: single Redis node is a SPOF; mitigated by Redis persistence (AOF) and the
    fact that rate-limit loss is non-critical (fail-open behaviour on Redis timeout).
"""

import time
from dataclasses import dataclass

import redis as redis_lib

# Lua script: atomically refill + consume.
# KEYS[1] = bucket key  ARGV[1] = capacity  ARGV[2] = refill_rate (tokens/sec)
# ARGV[3] = current_time_float  ARGV[4] = cost (default 1)
# Returns 1 if allowed, 0 if rejected.
_LUA_TOKEN_BUCKET = """
local key        = KEYS[1]
local capacity   = tonumber(ARGV[1])
local rate       = tonumber(ARGV[2])
local now        = tonumber(ARGV[3])
local cost       = tonumber(ARGV[4])

local data = redis.call('HMGET', key, 'tokens', 'last_refill')
local tokens      = tonumber(data[1]) or capacity
local last_refill = tonumber(data[2]) or now

local elapsed = math.max(0, now - last_refill)
local refilled = math.min(capacity, tokens + elapsed * rate)

if refilled < cost then
    -- Persist the refilled amount but don't consume
    redis.call('HMSET', key, 'tokens', refilled, 'last_refill', now)
    redis.call('EXPIRE', key, 3600)
    return 0
else
    redis.call('HMSET', key, 'tokens', refilled - cost, 'last_refill', now)
    redis.call('EXPIRE', key, 3600)
    return 1
end
"""


@dataclass
class BucketConfig:
    capacity: int        # max tokens in the bucket
    refill_rate: float   # tokens added per second


# Per-route configs.  Key = route prefix, value = BucketConfig.
ROUTE_CONFIGS: dict[str, BucketConfig] = {
    "/api/v1/public/auth/register": BucketConfig(capacity=10,  refill_rate=10 / 60),
    "/api/v1/public/auth/login":    BucketConfig(capacity=20,  refill_rate=20 / 60),
    "default":                      BucketConfig(capacity=200, refill_rate=200 / 60),
}


class TokenBucketLimiter:
    """Redis-backed token-bucket rate limiter."""

    def __init__(self, redis_client: redis_lib.Redis) -> None:
        self._redis = redis_client
        self._script = redis_client.register_script(_LUA_TOKEN_BUCKET)

    def _get_config(self, path: str) -> BucketConfig:
        for prefix, cfg in ROUTE_CONFIGS.items():
            if prefix != "default" and path.startswith(prefix):
                return cfg
        return ROUTE_CONFIGS["default"]

    def is_allowed(self, client_ip: str, path: str, cost: int = 1) -> bool:
        """Return True if the request is within rate limits, False otherwise."""
        cfg = self._get_config(path)
        key = f"tb:{client_ip}:{path}"
        try:
            result = self._script(
                keys=[key],
                args=[cfg.capacity, cfg.refill_rate, time.time(), cost],
            )
            return bool(result)
        except Exception:
            # Fail-open: if Redis is unreachable, allow the request.
            return True

    def get_remaining(self, client_ip: str, path: str) -> int:
        """Return how many tokens remain in the bucket (best-effort, not atomic)."""
        key = f"tb:{client_ip}:{path}"
        try:
            val = self._redis.hget(key, "tokens")
            return int(float(val)) if val else ROUTE_CONFIGS["default"].capacity
        except Exception:
            return ROUTE_CONFIGS["default"].capacity
