from pydantic import BaseModel, Field
from enum import Enum


# ---------- Enums ----------

class PlacementReason(str, Enum):
    intro = "intro"
    concept = "concept"
    demo = "demo"
    practice = "practice"


# ---------- Request Models ----------

class UserProfile(BaseModel):
    strong_subskills: list[str] = Field(
        default_factory=list,
        description="Skills the user is already proficient in",
    )
    weak_subskills: list[str] = Field(
        default_factory=list,
        description="Skills the user needs to improve",
    )
    current_level: str = Field(
        default="beginner",
        description="Current proficiency level: beginner, intermediate, or advanced",
    )


class Constraints(BaseModel):
    daily_time_minutes: int = Field(
        default=60,
        ge=15,
        le=480,
        description="Maximum study time per day in minutes",
    )
    target_course_duration_days: int = Field(
        default=7,
        ge=1,
        le=90,
        description="Total number of days to complete the course",
    )


class CurriculumRequest(BaseModel):
    user_profile: UserProfile
    constraints: Constraints
    course_topic: str = Field(
        ...,
        min_length=3,
        max_length=200,
        description="The main topic for the course",
    )


# ---------- Response Models ----------

class VideoItem(BaseModel):
    title: str
    youtube_url: str
    duration_minutes: int
    placement_reason: PlacementReason


class ModuleItem(BaseModel):
    module_number: int
    module_title: str
    learning_objective: str
    total_duration_minutes: int
    videos: list[VideoItem]


class CurriculumResponse(BaseModel):
    course_title: str
    level: str
    total_modules: int
    estimated_completion_days: int
    modules: list[ModuleItem]


class SavedCurriculumSummary(BaseModel):
    """Lightweight curriculum entry shown in the dashboard list."""
    id: str
    course_title: str
    topic: str
    level: str
    total_modules: int
    total_lessons: int = 0
    estimated_completion_days: int
    created_at: str
    progress_percent: int = 0
    completed_lessons_count: int = 0


class SavedCurriculumDetail(SavedCurriculumSummary):
    """Full curriculum with all module data and progress."""
    modules: list[ModuleItem]
    completed_lessons: list[str] = Field(
        default_factory=list,
        description="List of lesson IDs the user has completed",
    )


class ProgressUpdateRequest(BaseModel):
    """Payload for updating lesson progress on a saved curriculum."""
    completed_lessons: list[str] = Field(
        ...,
        description="Full list of completed lesson IDs for this curriculum",
    )


class TranscriptResponse(BaseModel):
    """Response containing the extracted YouTube transcript."""
    url: str
    transcript: str
