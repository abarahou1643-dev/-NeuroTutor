from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    # 🔧 CONFIG Pydantic (IMPORTANT)
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra="ignore"  # ✅ IGNORE les variables inconnues (.env safe)
    )

    # Application
    app_name: str = "NeuroTutor AI Service"
    version: str = "1.0.0"
    environment: str = "development"
    debug: bool = True

    # Server
    host: str = "0.0.0.0"
    port: int = 8082
    cors_origins: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173"
    ]

    # JWT
    jwt_secret: str = "your-super-secret-jwt-key-change-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # Redis
    redis_url: str = "redis://localhost:6379"

    # 🔥 Tesseract OCR
    tesseract_cmd: str = "tesseract"

    # Model paths
    ocr_model_path: str = "./models/ocr"
    nlp_model_path: str = "./models/nlp"


settings = Settings()
