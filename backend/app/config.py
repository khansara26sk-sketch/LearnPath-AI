from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # App
    app_name: str = "LearnPath AI"
    app_env: str = "development"
    debug: bool = True
    api_prefix: str = "/api/v1"

    # Server
    host: str = "0.0.0.0"
    port: int = 8000

    # CORS
    cors_origins: str = (
        "http://localhost:5173,"
        "http://localhost:3000,"
        "http://localhost:3001"
    )

    # MongoDB
    mongodb_uri: str = "mongodb://localhost:27017"
    mongodb_db_name: str = "learnpath_ai"

    # Groq
    groq_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"
    groq_vision_model: str = "meta-llama/llama-4-scout-17b-16e-instruct"

    # AI
    use_mock_ai: bool = False

    @property
    def cors_origin_list(self) -> List[str]:
        return [
            origin.strip()
            for origin in self.cors_origins.split(",")
            if origin.strip()
        ]

    @property
    def groq_enabled(self) -> bool:
        return (
            len(self.groq_api_key.strip()) > 0
            and not self.use_mock_ai
        )


@lru_cache
def get_settings() -> Settings:
    settings = Settings()

    print("\n========== APP CONFIG ==========")
    print("APP:", settings.app_name)
    print("ENV:", settings.app_env)
    print("GROQ MODEL:", settings.groq_model)
    print("GROQ VISION MODEL:", settings.groq_vision_model)
    print("MOCK AI:", settings.use_mock_ai)
    print("GROQ ENABLED:", settings.groq_enabled)
    print("API KEY FOUND:", bool(settings.groq_api_key))
    print("================================\n")

    return settings