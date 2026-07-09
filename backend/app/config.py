import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Aapat Setu - Emergency Coordination Platform"

    # Defaults to XAMPP MySQL (root / no password / database `aapatsetudb`)
    # Override via .env file or DATABASE_URL env var.
    database_url: str = os.getenv(
        "DATABASE_URL",
        "mysql+pymysql://root:@localhost:3306/aapatsetudb?charset=utf8mb4",
    )

    # ===== JWT Settings =====
    # Change SECRET_KEY in backend/.env to your own long random string.
    # Generate one with:  python -c "import secrets; print(secrets.token_hex(32))"
    secret_key: str = os.getenv(
        "SECRET_KEY",
        "aapatsetudb-jwt-secret-change-this-to-your-own-random-string",
    )
    algorithm: str = os.getenv("ALGORITHM", "HS256")
    access_token_expire_minutes: int = int(
        os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440")
    )  # 24h default

    # Optional real LLM keys
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    anthropic_api_key: str = os.getenv("ANTHROPIC_API_KEY", "")

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
