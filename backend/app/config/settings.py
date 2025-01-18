from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # Firebase settings
    FIREBASE_PROJECT_ID: str
    FIREBASE_PRIVATE_KEY_ID: str
    FIREBASE_PRIVATE_KEY: str
    FIREBASE_CLIENT_EMAIL: str
    FIREBASE_CLIENT_ID: str
    FIREBASE_CLIENT_CERT_URL: str

    # Supabase settings
    SUPABASE_URL: str
    SUPABASE_KEY: str

    # Application settings
    APP_NAME: str = "HAND API"
    DEBUG: bool = False
    
    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()