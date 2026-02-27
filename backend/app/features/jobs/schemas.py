"""Pydantic models for the jobs feature."""

from pydantic import BaseModel


class JobSearchRequest(BaseModel):
    """Body sent by the frontend when requesting matched jobs."""
    skills: list[str] = []


class JobItem(BaseModel):
    """A single job listing returned to the frontend."""
    id: str
    title: str
    company: str
    location: str
    type: str            # remote / onsite / hybrid / etc.
    description: str
    fitScore: int        # 0-100 match percentage
    matchedSkills: list[str]
    missingSkills: list[str]
    experienceLevel: str
    source: str          # "arbeitnow"
    saved: bool = False
    url: str = ""
