from datetime import datetime
from pydantic import BaseModel, Field


class UserSkill(BaseModel):
    id: str | None = None
    skill_name: str
    proficiency_level: str | None = None
    created_at: datetime | None = None


class ProfileResponse(BaseModel):
    id: str
    name: str | None = None
    target_job: str | None = None
    skills: list[UserSkill] = Field(default_factory=list)


class ProfileUpdateRequest(BaseModel):
    name: str | None = None
    target_job: str | None = None


class SkillAddRequest(BaseModel):
    skill_name: str = Field(..., min_length=1, description="Name of the skill to add")
    proficiency_level: str | None = Field(default=None, description="e.g., beginner, intermediate, advanced")


class RiasecScoresRequest(BaseModel):
    R: int = Field(..., ge=0, le=100, description="Realistic score (0-100)")
    I: int = Field(..., ge=0, le=100, description="Investigative score (0-100)")
    A: int = Field(..., ge=0, le=100, description="Artistic score (0-100)")
    S: int = Field(..., ge=0, le=100, description="Social score (0-100)")
    E: int = Field(..., ge=0, le=100, description="Enterprising score (0-100)")
    C: int = Field(..., ge=0, le=100, description="Conventional score (0-100)")
