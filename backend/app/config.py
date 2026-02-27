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

    # Community
    appwrite_community_groups_collection_id: str = "community_groups"
    appwrite_community_posts_collection_id: str = "community_posts"
    appwrite_community_comments_collection_id: str = "community_comments"
    appwrite_community_votes_collection_id: str = "community_votes"
    appwrite_community_memberships_collection_id: str = "community_memberships"

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
    ollama_endpoint: str = "http://localhost:11434"
    ollama_model: str = "alibayram/smollm3"

    # Federated Learning
    fl_enabled: bool = True
    fl_model_path: str = ""  # defaults to backend/fl_global_model.joblib if empty

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
