from pydantic import BaseModel, Field


class SkillEvaluationRequest(BaseModel):
    target_job: str = Field(
        ...,
        min_length=2,
        max_length=150,
        description="Target job title to evaluate skills against",
    )
    user_skills: list[str] = Field(
        default_factory=list,
        description="List of the user's current skills (can be empty)",
    )


class ONetSkill(BaseModel):
    """A single skill required by an occupation, as returned by O*NET."""
    skill: str
    importance: float = Field(ge=0, le=100, description="Importance score 0–100")


class ESCONormalizedSkill(BaseModel):
    """A skill after ESCO taxonomy normalization."""
    skill: str = Field(description="Canonical (normalized) skill name")
    category: str = Field(default="", description="ESCO skill category / broader concept")


class SkillEvaluationResponse(BaseModel):
    target_job: str
    strong_subskills: list[str] = Field(default_factory=list)
    weak_subskills: list[str] = Field(default_factory=list)
    recommended_courses: list[str] = Field(default_factory=list)
