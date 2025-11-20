from pydantic import computed_field
from pydantic_core import MultiHostUrl
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Acme inventory Service"
    app_version: str = "1.0.0"

    # DB fields from .env
    postgres_db: str
    postgres_host: str
    postgres_port: int
    postgres_user: str
    postgres_password: str

    redis_url: str = "redis://localhost:6379/0"
    celery_broker_url: str = "redis://localhost:6379/0"
    celery_result_backend: str = "redis://localhost:6379/0"
    secret_key: str = "dev-secret-key-change-in-production"
    environment: str = "development"
    upload_dir: str = "uploads"
    max_upload_size: int = 100 * 1024 * 1024  # 100MB

    @computed_field
    @property
    def asyncpg_url(self) -> str:
        return MultiHostUrl.build(
            scheme="postgresql+asyncpg",
            username=self.postgres_user,
            password=self.postgres_password,
            host=self.postgres_host,
            path=self.postgres_db,
        ).unicode_string()

    @computed_field
    @property
    def postgres_url(self) -> str:
        return MultiHostUrl.build(
            scheme="postgresql+psycopg2",
            username=self.postgres_user,
            password=self.postgres_password,
            host=self.postgres_host,
            path=self.postgres_db,
        ).unicode_string()

    class Config:
        env_file = ".env"


settings = Settings()
