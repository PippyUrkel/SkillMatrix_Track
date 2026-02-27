"""Pydantic schemas for FL assessment endpoints."""

from pydantic import BaseModel, Field


class AnswerItem(BaseModel):
    """A single test question + answer pair."""
    question: str = Field(..., description="The test question")
    student_answer: str = Field(..., description="The student's answer")
    correct_answer: str = Field(..., description="The expected correct answer")


class TestSubmission(BaseModel):
    """Payload for submitting test answers for FL assessment."""
    student_id: str = Field(default="anonymous", description="Student identifier")
    module_id: str = Field(default="", description="Curriculum module being tested")
    curriculum_id: str = Field(default="", description="Curriculum this test belongs to")
    answers: list[AnswerItem] = Field(
        ...,
        min_length=1,
        description="List of question-answer pairs to assess",
    )


class PerAnswerResult(BaseModel):
    """Assessment result for a single answer."""
    question: str
    level: str = Field(description="weak | partial | strong")
    confidence: float


class AssessmentSummary(BaseModel):
    """Aggregate counts of comprehension levels."""
    weak_count: int
    partial_count: int
    strong_count: int
    total: int


class AssessmentResult(BaseModel):
    """Full assessment response from the FL engine."""
    comprehension_level: str = Field(description="Overall: weak | partial | strong")
    confidence: float = Field(description="Overall confidence (0-100)")
    recommendation: str = Field(description="Action: expand | maintain | shorten")
    per_answer: list[PerAnswerResult] = Field(default_factory=list)
    summary: AssessmentSummary


class FLStatusResponse(BaseModel):
    """FL engine status check response."""
    running: bool
    model_ready: bool
