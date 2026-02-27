from pydantic import BaseModel, Field
from enum import Enum


# ---------- Enums ----------

class DataSource(str, Enum):
    github = "github"
    linkedin = "linkedin"
    resume = "resume"
    text = "text"


class SkillLevel(str, Enum):
    strong = "strong"
    moderate = "moderate"
    weak = "weak"


# ---------- Request Models ----------

class GitHubAnalysisRequest(BaseModel):
    github_username: str = Field(
        ...,
        min_length=1,
        max_length=39,
        description="GitHub username to analyze",
    )
    target_role: str = Field(
        default="Software Developer",
        max_length=100,
        description="Target job role to compare skills against",
    )


class ResumeAnalysisRequest(BaseModel):
    resume_text: str = Field(
        ...,
        min_length=50,
        max_length=20000,
        description="Plain-text resume content",
    )
    target_role: str = Field(
        default="Software Developer",
        max_length=100,
        description="Target job role to compare skills against",
    )


class TextAnalysisRequest(BaseModel):
    profile_text: str = Field(
        ...,
        min_length=20,
        max_length=10000,
        description="Profile summary text (e.g. from LinkedIn about section)",
    )
    source: str = Field(
        default="linkedin",
        description="Origin of the text: linkedin, portfolio, other",
    )
    target_role: str = Field(
        default="Software Developer",
        max_length=100,
        description="Target job role to compare skills against",
    )


# ---------- Response Models ----------

class SkillDetail(BaseModel):
    name: str = Field(description="Canonical skill name")
    proficiency_score: float = Field(
        ge=0.0, le=1.0,
        description="Estimated proficiency 0.0–1.0",
    )
    level: SkillLevel = Field(description="Classified as strong, moderate, or weak")
    evidence: str = Field(
        default="",
        description="Brief justification for the score",
    )


class SkillGapReport(BaseModel):
    current_level: str = Field(
        description="Overall level: beginner, intermediate, or advanced",
    )
    strong_subskills: list[str] = Field(
        default_factory=list,
        description="Skills classified as strong",
    )
    weak_subskills: list[str] = Field(
        default_factory=list,
        description="Skills classified as weak",
    )
    all_skills: list[SkillDetail] = Field(
        default_factory=list,
        description="Full scored skill breakdown",
    )
    confidence_score: float = Field(
        ge=0.0, le=1.0,
        description="How confident the analysis is (0.0–1.0)",
    )
    inferred_from: DataSource = Field(
        description="Which data source was used",
    )
    target_role: str = Field(
        default="Software Developer",
        description="The role skills were compared against",
    )
