from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    """Application settings"""
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    ENV: str = "development"
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    
    # AI Model
    MODEL_TEMPERATURE: float = 0.7
    MAX_TOKENS: int = 1000
    
    # API Keys
    NEMOTRON_API_KEY: str = ""
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()

