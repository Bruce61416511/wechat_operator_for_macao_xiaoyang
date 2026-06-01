from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str = "sqlite+aiosqlite:///./xiaoyang.db"
    redis_url: str = "redis://localhost:6379/0"
    jwt_secret_key: str = "dev-secret-key"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 10080
    wechat_appid: str = ""
    wechat_secret: str = ""
    deepseek_api_key: str = ""
    deepseek_base_url: str = "https://api.deepseek.com/v1"
    deepseek_model: str = "deepseek-chat"
    chroma_persist_dir: str = "./chroma_data"
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = False
    log_level: str = "INFO"

    @field_validator("debug", mode="before")
    @classmethod
    def parse_debug(cls, v):
        if isinstance(v, bool):
            return v
        if isinstance(v, str):
            return v.lower() in ("true", "1", "yes", "on")
        return bool(v)


@lru_cache()
def get_settings() -> Settings:
    return Settings()
