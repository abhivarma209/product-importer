from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    database_url: str = "postgresql://postgres:postgres@localhost:5432/fileimporter"
    redis_url: str = "redis://localhost:6379/0"
    celery_broker_url: str = "redis://localhost:6379/0"
    celery_result_backend: str = "redis://localhost:6379/0"
    secret_key: str = "dev-secret-key-change-in-production"
    environment: str = "development"
    upload_dir: str = "uploads"
    max_upload_size: int = 100 * 1024 * 1024  # 100MB
    
    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    return Settings()

