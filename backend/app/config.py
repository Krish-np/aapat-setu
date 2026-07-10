import os
from pydantic import Field, AliasChoices
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "Aapat Setu - Emergency Coordination Platform"

    # Use APP_DATABASE_URL to avoid collision with Replit's managed DATABASE_URL
    # (which points at Replit Postgres).  SQLite is the default on Replit.
    database_url: str = Field(
        default="sqlite:///./aapatsetu.db",
        validation_alias=AliasChoices("APP_DATABASE_URL", "app_database_url"),
    )

    # JWT — prefers SESSION_SECRET (Replit secret) then SECRET_KEY then fallback.
    secret_key: str = Field(
        default="aapatsetudb-jwt-secret-change-this-to-your-own-random-string",
        validation_alias=AliasChoices("SESSION_SECRET", "SECRET_KEY", "secret_key"),
    )
    algorithm: str = Field(default="HS256", validation_alias=AliasChoices("ALGORITHM", "algorithm"))
    access_token_expire_minutes: int = Field(
        default=1440,
        validation_alias=AliasChoices("ACCESS_TOKEN_EXPIRE_MINUTES", "access_token_expire_minutes"),
    )

    # Optional real LLM keys
    openai_api_key: str = Field(default="", validation_alias=AliasChoices("OPENAI_API_KEY", "openai_api_key"))
    anthropic_api_key: str = Field(default="", validation_alias=AliasChoices("ANTHROPIC_API_KEY", "anthropic_api_key"))


settings = Settings()
