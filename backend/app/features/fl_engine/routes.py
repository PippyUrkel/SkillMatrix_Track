"""FL Assessment API routes."""

import logging

from fastapi import APIRouter, HTTPException

from app.features.fl_engine.schemas import (
    TestSubmission,
    AssessmentResult,
    FLStatusResponse,
)
from app.features.fl_engine.orchestrator import get_orchestrator

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/fl", tags=["Federated Learning"])


@router.post(
    "/assess",
    response_model=AssessmentResult,
    summary="Assess student comprehension via FL model",
    description=(
        "Submit test answers for FL-based comprehension assessment. "
        "Returns per-answer and overall comprehension level (weak/partial/strong) "
        "plus a recommendation to expand, maintain, or shorten the curriculum module."
    ),
)
async def assess_student(submission: TestSubmission):
    """
    Run FL inference on student test answers.

    The model assesses each answer's comprehension level and recommends
    whether to expand (more depth), maintain, or shorten (advance faster)
    the student's curriculum modules.
    """
    try:
        orchestrator = get_orchestrator()
        answers = [
            {
                "question": a.question,
                "student_answer": a.student_answer,
                "correct_answer": a.correct_answer,
            }
            for a in submission.answers
        ]
        result = orchestrator.assess_student(answers)
        return AssessmentResult(**result)
    except Exception as e:
        logger.error("FL assessment failed: %s", e, exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"FL assessment failed: {str(e)}",
        )


@router.get(
    "/status",
    response_model=FLStatusResponse,
    summary="Check FL engine status",
)
async def fl_status():
    """Check if the FL engine is running and the model is ready."""
    orchestrator = get_orchestrator()
    return FLStatusResponse(
        running=orchestrator.is_running,
        model_ready=orchestrator.model_ready,
    )
