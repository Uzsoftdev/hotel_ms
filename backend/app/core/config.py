from functools import lru_cache
from typing import List

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # App
    APP_NAME: str = "allStay Hotel API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "production"

    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Database
    DATABASE_URL: str
    DATABASE_URL_SYNC: str = ""        # psycopg2 URL for Alembic (auto-derived if blank)
    DATABASE_URL_PRIMARY: str = ""     # write path via PgBouncer → primary (falls back to DATABASE_URL_SYNC)
    DATABASE_URL_REPLICA: str = ""     # read path via PgBouncer → replica(s) (falls back to primary)

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # CORS — comma-separated list of allowed origins
    ALLOWED_ORIGINS: str = "http://localhost:5173"

    @field_validator("SECRET_KEY")
    @classmethod
    def secret_key_must_be_strong(cls, v: str) -> str:
        if len(v) < 32:
            raise ValueError("SECRET_KEY must be at least 32 characters")
        return v

    def get_allowed_origins(self) -> List[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]

    # Meilisearch full-text search
    MEILISEARCH_URL: str = "http://meilisearch:7700"
    MEILISEARCH_KEY: str = ""

    # Frontend URL — used for email verification and password reset links
    FRONTEND_URL: str = "http://localhost:5173"

    # MinIO object storage (Phase 3 — multi-replica avatar fix)
    MINIO_ENDPOINT: str = "http://minio:9000"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin"
    MINIO_BUCKET: str = "hotel-avatars"
    MINIO_PUBLIC_URL: str = "http://localhost:9000"   # override in prod with CDN/domain

    # Jaeger / OpenTelemetry tracing (Phase 3)
    JAEGER_ENDPOINT: str = ""   # e.g. http://jaeger:4317 — tracing disabled if blank

    # Email (SMTP)
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAIL_FROM: str = ""
    EMAIL_FROM_NAME: str = "allStay"
    EMAILS_ENABLED: bool = False

    # Google OAuth (direct — no Supabase)
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = "https://allstay.rest/auth/callback"

    # Anthropic / Claude AI
    ANTHROPIC_API_KEY: str = ""


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]


settings = get_settings()

# Convenience alias used by legacy imports: `from app.core import config; config.SECRET_KEY`
SECRET_KEY = settings.SECRET_KEY
