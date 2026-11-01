"""Application configuration loaded from environment variables."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central configuration — reads from .env or the environment."""

    mongodb_uri: str = "mongodb://localhost:27017"
    db_name: str = "sipwise"
    risk_free_rate: float = 0.065
    monte_carlo_simulations: int = 1000
    cors_origins: str = "http://localhost:5173"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
