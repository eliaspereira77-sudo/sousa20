"""
SOUSA 2.0 - Configurações centrais
"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Core
    gemini_api_key: Optional[str] = None
    model_name: str = "gemini-1.5-flash"

    # Server
    port: int = 5000
    flask_debug: bool = False

    # Ruflo
    ruflo_enabled: bool = True

    # Voice & Avatar (futuro)
    voice_clone_enabled: bool = False
    avatar_enabled: bool = False

    # Distribution
    global_distribution_enabled: bool = False

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
