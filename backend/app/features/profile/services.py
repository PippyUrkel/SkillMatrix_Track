import logging
import time
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.query import Query
from appwrite.id import ID
from appwrite.exception import AppwriteException

from app.config import get_settings
from app.features.profile.schemas import (
    ProfileUpdateRequest,
)

logger = logging.getLogger(__name__)

# Module-level profile cache: { user_id: (profile_dict, expiry_ts) }
_profile_cache: dict[str, tuple[dict, float]] = {}
_CACHE_TTL = 10  # seconds


class ProfileService:
    def __init__(self, appwrite_client: Client):
        self.client = appwrite_client
        self.databases = Databases(self.client)
        settings = get_settings()
        self.db_id = settings.appwrite_database_id
        self.profiles_coll = settings.appwrite_profiles_collection_id
        self.skills_coll = settings.appwrite_skills_collection_id

    def _ensure_profile(self, user_id: str) -> dict:
        """Get or create the profile document (upsert pattern)."""
        try:
            return self.databases.get_document(
                database_id=self.db_id,
                collection_id=self.profiles_coll,
                document_id=user_id,
            )
        except AppwriteException as e:
            if e.code == 404:
                return self.databases.create_document(
                    database_id=self.db_id,
                    collection_id=self.profiles_coll,
                    document_id=user_id,
                    data={"user_id": user_id},
                )
            raise

    def get_profile(self, user_id: str) -> dict:
        """Fetch user profile and associated skills (with short TTL cache)."""
        now = time.monotonic()
        cached = _profile_cache.get(user_id)
        if cached and now < cached[1]:
            return cached[0]

        try:
            profile_resp = self._ensure_profile(user_id)

            skills_resp = self.databases.list_documents(
                database_id=self.db_id,
                collection_id=self.skills_coll,
                queries=[Query.equal("user_id", user_id)],
            )

            result = {
                "id": profile_resp.get("user_id", user_id),
                "name": profile_resp.get("name"),
                "target_job": profile_resp.get("target_job"),
                "skills": [
                    {
                        "id": s.get("$id"),
                        "skill_name": s.get("skill_name"),
                        "proficiency_level": s.get("proficiency_level"),
                        "created_at": s.get("$createdAt"),
                    }
                    for s in skills_resp.get("documents", [])
                ],
            }
            _profile_cache[user_id] = (result, now + _CACHE_TTL)
            return result
        except Exception as e:
            logger.error(f"Error fetching profile: {e}")
            raise ValueError("Failed to fetch profile data")

    def update_profile(self, user_id: str, data: ProfileUpdateRequest) -> dict:
        """Update profile fields. Creates the document if it doesn't exist yet."""
        update_data = {k: v for k, v in data.model_dump().items() if v is not None}
        if not update_data:
            return self.get_profile(user_id)

        try:
            self._ensure_profile(user_id)
            self.databases.update_document(
                database_id=self.db_id,
                collection_id=self.profiles_coll,
                document_id=user_id,
                data=update_data,
            )
            _profile_cache.pop(user_id, None)  # invalidate so next fetch is fresh
            return self.get_profile(user_id)
        except Exception as e:
            logger.error(f"Error updating profile: {e}")
            raise ValueError("Failed to update profile data")

    def add_skill(self, user_id: str, skill_name: str, proficiency_level: str | None = None) -> dict:
        """Add or update a skill in the user's profile."""
        try:
            skill_name_lower = skill_name.strip().lower()
            skill_data = {"user_id": user_id, "skill_name": skill_name_lower}
            if proficiency_level:
                skill_data["proficiency_level"] = proficiency_level

            # Check if skill already exists
            existing = self.databases.list_documents(
                database_id=self.db_id,
                collection_id=self.skills_coll,
                queries=[
                    Query.equal("user_id", user_id),
                    Query.equal("skill_name", skill_name_lower),
                ],
            )

            existing_docs = existing.get("documents", [])
            if existing_docs:
                self.databases.update_document(
                    database_id=self.db_id,
                    collection_id=self.skills_coll,
                    document_id=existing_docs[0]["$id"],
                    data=skill_data,
                )
            else:
                self.databases.create_document(
                    database_id=self.db_id,
                    collection_id=self.skills_coll,
                    document_id=ID.unique(),
                    data=skill_data,
                )

            _profile_cache.pop(user_id, None)  # invalidate cache
            return self.get_profile(user_id)
        except Exception as e:
            logger.error(f"Error adding skill: {e}")
            raise ValueError(f"Failed to add skill: {skill_name}")

    def remove_skill(self, user_id: str, skill_name: str) -> dict:
        """Remove a skill from the user's profile."""
        try:
            skill_name_lower = skill_name.strip().lower()
            existing = self.databases.list_documents(
                database_id=self.db_id,
                collection_id=self.skills_coll,
                queries=[
                    Query.equal("user_id", user_id),
                    Query.equal("skill_name", skill_name_lower),
                ],
            )

            for doc in existing.get("documents", []):
                self.databases.delete_document(
                    database_id=self.db_id,
                    collection_id=self.skills_coll,
                    document_id=doc["$id"],
                )

            _profile_cache.pop(user_id, None)  # invalidate cache
            return self.get_profile(user_id)
        except Exception as e:
            logger.error(f"Error removing skill: {e}")
            raise ValueError("Failed to remove skill")
