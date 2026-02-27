import logging
from fastapi import APIRouter, Depends, HTTPException, status
from appwrite.client import Client

from app.databases.appwrite_client import get_appwrite_client
from app.middleware.auth_middleware import get_current_user
from app.features.profile.schemas import (
    ProfileResponse,
    ProfileUpdateRequest,
    SkillAddRequest,
)
from app.features.profile.services import ProfileService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/profile", tags=["Profile"])


def get_profile_service(
    client: Client = Depends(get_appwrite_client),
) -> ProfileService:
    """Dependency injection for ProfileService."""
    return ProfileService(client)


@router.get("/", response_model=ProfileResponse)
async def get_profile(
    user: dict = Depends(get_current_user),
    service: ProfileService = Depends(get_profile_service),
):
    """Fetch the logged-in user's profile and saved skills."""
    try:
        return service.get_profile(user["id"])
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/", response_model=ProfileResponse)
async def update_profile(
    request: ProfileUpdateRequest,
    user: dict = Depends(get_current_user),
    service: ProfileService = Depends(get_profile_service),
):
    """Update user profile information (like target_job)."""
    try:
        return service.update_profile(user["id"], request)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/skills", response_model=ProfileResponse)
async def add_skill(
    request: SkillAddRequest,
    user: dict = Depends(get_current_user),
    service: ProfileService = Depends(get_profile_service),
):
    """Manually add a skill to the user's profile."""
    try:
        return service.add_skill(
            user["id"], request.skill_name, request.proficiency_level
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/skills/{skill_name}", response_model=ProfileResponse)
async def remove_skill(
    skill_name: str,
    user: dict = Depends(get_current_user),
    service: ProfileService = Depends(get_profile_service),
):
    """Remove a specific skill from the user's profile."""
    try:
        return service.remove_skill(user["id"], skill_name)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
