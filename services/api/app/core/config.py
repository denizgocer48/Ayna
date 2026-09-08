from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    supabase_url: str = ""
    supabase_service_role_key: str = ""
    supabase_jwt_secret: str = ""
    redis_url: str = "redis://localhost:6379/0"
    sentry_dsn: str = ""
    anthropic_api_key: str = ""

    # Bumped whenever a metric formula or scoring weight changes. Stored on every
    # scan so an old result stays explainable after the engine moves on.
    engine_version: str = "0.1.0"

    # Data minimisation: the source image is a means to an end. Once metrics are
    # extracted we do not need it, and keeping it is the single largest privacy
    # liability in the product.
    delete_image_after_analysis: bool = True


@lru_cache
def get_settings() -> Settings:
    return Settings()
