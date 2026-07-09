import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Aapat Setu - Emergency Coordination Platform"

    # Defaults to XAMPP MySQL (root / no password / database `aapatsetu`)
    # Override via .env file or DATABASE_URL env var.
    database_url: str = os.getenv(
        "DATABASE_URL",
        "mysql+pymysql://root:@localhost:3306/aapatsetu?charset=utf8mb4",
    )

    secret_key: str = os.getenv(
        "SECRET_KEY",
        "aapatsetu-hackfusion-2026-super-secret-key-change-in-prod",
    )
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24  # 24h for hackathon convenience

    # Optional real LLM keys
    openai_api_key: str = ""
    anthropic_api_key: str = ""

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
