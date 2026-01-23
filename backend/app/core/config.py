import json
from typing import List

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Environment
    ENVIRONMENT: str = Field(default="development")  # development | staging | production

    # API Configuration
    API_V1_STR: str = Field(default="/api/v1")
    PROJECT_NAME: str = Field(default="Giga Hidjrika Portfolio Backend")

    # Database
    DATABASE_URL: str = Field(default="sqlite:///./portfolio.db")

    # Security
    SECRET_KEY: str = Field(default="")
    ALGORITHM: str = Field(default="HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30)
    REFRESH_TOKEN_EXPIRE_DAYS: int = Field(default=14)

    # Admin credentials (optional; if provided, must be complete)
    ADMIN_USERNAME: str = Field(default="")
    ADMIN_EMAIL: str = Field(default="")
    ADMIN_PASSWORD: str = Field(default="")

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = Field(
        default_factory=lambda: [
            "http://localhost:3000",
            "https://localhost:3000",
            "http://localhost:3001",  # For admin dashboard
            "http://localhost:3002",  # For frontend development
            "https://www.gigahidjrikaaa.my.id",
            "https://gigahidjrikaaa.my.id",
        ]
    )

    # Email Configuration
    SENDGRID_API_KEY: str = Field(default="")
    FROM_EMAIL: str = Field(default="")
    TO_EMAIL: str = Field(default="")

    # SMTP Configuration
    SMTP_HOST: str = Field(default="smtp.gmail.com")
    SMTP_PORT: int = Field(default=587)
    SMTP_USER: str = Field(default="")
    SMTP_PASSWORD: str = Field(default="")

    # Cloudinary Configuration
    CLOUDINARY_CLOUD_NAME: str = Field(default="")
    CLOUDINARY_API_KEY: str = Field(default="")
    CLOUDINARY_API_SECRET: str = Field(default="")
    CLOUDINARY_FOLDER: str = Field(default="portfolio")

    # Basic rate limiting (in-memory; suitable for single-process dev)
    RATE_LIMIT_WINDOW_SECONDS: int = Field(default=60)
    RATE_LIMIT_LOGIN_PER_WINDOW: int = Field(default=10)
    RATE_LIMIT_CONTACT_PER_WINDOW: int = Field(default=10)

    @property
    def is_development(self) -> bool:
        return self.ENVIRONMENT.lower() == "development"

    @field_validator("ENVIRONMENT")
    @classmethod
    def _validate_environment(cls, value: str) -> str:
        normalized = (value or "").strip().lower()
        if normalized not in {"development", "staging", "production"}:
            raise ValueError("ENVIRONMENT must be one of: development, staging, production")
        return normalized

    @field_validator("SECRET_KEY")
    @classmethod
    def _validate_secret_key(cls, value: str, info):
        secret = (value or "").strip()
        env = (info.data.get("ENVIRONMENT") or "development").lower()

        # In development, allow empty/weak secrets (but tokens will be insecure).
        if env == "development":
            return secret

        # In non-dev, fail fast.
        if not secret:
            raise ValueError("SECRET_KEY must be set in non-development environments")
        if len(secret) < 32:
            raise ValueError("SECRET_KEY must be at least 32 characters in non-development environments")
        return secret

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def _assemble_cors_origins(cls, value):
        if value is None:
            return value
        if isinstance(value, str):
            stripped = value.strip()
            if not stripped:
                return []
            if stripped.startswith("["):
                try:
                    parsed = json.loads(stripped)
                    if isinstance(parsed, list):
                        return [str(origin).strip() for origin in parsed if str(origin).strip()]
                except json.JSONDecodeError:
                    pass
            return [origin.strip() for origin in stripped.split(",") if origin.strip()]
        if isinstance(value, (list, tuple, set)):
            return [str(origin).strip() for origin in value if str(origin).strip()]
        return value

    @field_validator("ADMIN_PASSWORD")
    @classmethod
    def _validate_admin_credentials_complete(cls, value: str, info):
        username = (info.data.get("ADMIN_USERNAME") or "").strip()
        email = (info.data.get("ADMIN_EMAIL") or "").strip()
        # NOTE: `info.data` contains only previously-validated fields and does not
        # include the value for the field currently being validated.
        password = (value or "").strip()

        any_set = bool(username or email or password)
        all_set = bool(username and email and password)
        if any_set and not all_set:
            raise ValueError("ADMIN_USERNAME, ADMIN_EMAIL, and ADMIN_PASSWORD must all be set together")
        return password


settings = Settings()
