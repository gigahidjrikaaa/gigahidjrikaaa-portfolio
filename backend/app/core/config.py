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

    @field_validator("ADMIN_PASSWORD")
    @classmethod
    def _validate_admin_credentials_complete(cls, _value: str, info):
        username = (info.data.get("ADMIN_USERNAME") or "").strip()
        email = (info.data.get("ADMIN_EMAIL") or "").strip()
        password = (info.data.get("ADMIN_PASSWORD") or "").strip()

        any_set = bool(username or email or password)
        all_set = bool(username and email and password)
        if any_set and not all_set:
            raise ValueError("ADMIN_USERNAME, ADMIN_EMAIL, and ADMIN_PASSWORD must all be set together")
        return password


settings = Settings()
