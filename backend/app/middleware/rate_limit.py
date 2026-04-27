# Legacy compatibility shim — we now use TokenBucketMiddleware (R11) instead of slowapi.
# This stub keeps any lingering @limiter.limit() decorators from crashing at import time.

class _NoOpLimiter:
    def limit(self, *args, **kwargs):
        def decorator(func):
            return func
        return decorator


limiter = _NoOpLimiter()
