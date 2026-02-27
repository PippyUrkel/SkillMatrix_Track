from pydantic import BaseModel, Field


class PaidCourseRequest(BaseModel):
    topic: str = Field(..., min_length=2, max_length=200, description="Skill or topic to find courses for")
    skill_level: str = Field(default="beginner", description="beginner, intermediate, or advanced")
    max_results: int = Field(default=6, ge=2, le=12, description="Number of recommendations")


class PaidCourseItem(BaseModel):
    title: str
    platform: str  # "Coursera" | "Udemy" | "edX"
    description: str
    estimated_price: str  # e.g., "$12.99", "Free (audit)", "$49/month"
    url: str
    difficulty: str  # "beginner" | "intermediate" | "advanced"
    estimated_duration: str  # e.g., "4 weeks", "12 hours"
    rating: float = Field(default=4.5, ge=0, le=5)


class PaidCourseResponse(BaseModel):
    topic: str
    courses: list[PaidCourseItem]
