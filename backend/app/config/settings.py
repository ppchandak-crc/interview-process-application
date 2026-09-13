from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    PROJECT_NAME: str = "Interview Process System"
    VERSION: str = "1.0.0"
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    # Database
    DATABASE_URL: str
    
    # Supabase Storage
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    
    # CORS
    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"]

    class Config:
        env_file = ".env"
        case_sensitive = True

@lru_cache()
def get_settings():
    return Settings()
