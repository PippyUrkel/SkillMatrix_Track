from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Appwrite
    appwrite_endpoint: str
    appwrite_project_id: str
    appwrite_api_key: str
    appwrite_database_id: str
    appwrite_profiles_collection_id: str
    appwrite_skills_collection_id: str
    appwrite_curricula_collection_id: str

    # JWT
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # API Keys
    youtube_api_key: str = ""
    google_gemini_api_key: str = ""
    github_token: str = ""
    onet_username: str = ""
    onet_password: str = ""

    # LLM
    ollama_model: str = "alibayram/smollm3"

    # CORS
    cors_origins: str = "http://localhost:3000,http://localhost:3001,http://localhost:5173"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
