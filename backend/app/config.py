from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Aapat Setu - Emergency Coordination Platform"
    database_url: str = "sqlite:///./aapatsetu.db"
    secret_key: str = "aapatsetu-hackfusion-2026-super-secret-key-change-in-prod"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24  # 24 hours for hackathon convenience

    # Optional real LLM. If empty, use heuristic/mock AI.
    openai_api_key: str = ""
    anthropic_api_key: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
