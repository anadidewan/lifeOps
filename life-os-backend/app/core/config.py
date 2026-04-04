"""Application configuration settings."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    APP_NAME: str = "LifeOS Backend"
    DEBUG: bool = False
    DATABASE_URL: str = "postgresql+psycopg2://postgres:password@localhost:5432/lifeops"

    # Firebase settings
    FIREBASE_PROJECT_ID: str = ""
    FIREBASE_PRIVATE_KEY: str = ""
    FIREBASE_CLIENT_EMAIL: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
