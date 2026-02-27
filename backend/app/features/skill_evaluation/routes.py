"""Skill Gap Evaluation endpoint."""

import logging

from fastapi import APIRouter, HTTPException

from app.features.skill_evaluation.schemas import (
    SkillEvaluationRequest,
    SkillEvaluationResponse,
)
from app.features.skill_evaluation.evaluator import SkillEvaluator

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/skills", tags=["Skill Evaluation"])


@router.post(
    "/evaluate",
    response_model=SkillEvaluationResponse,
    summary="Evaluate user skills against a target job",
    description=(
        "Uses O*NET (job requirements) and ESCO (skill normalization) "
        "to classify user skills as strong or weak, then recommends "
        "courses to close the gap."
    ),
)
async def evaluate_skills(request: SkillEvaluationRequest):
    """
    Accepts a target job title and list of user skills.
    Returns strong/weak classification and 3 course recommendations.
    """
    try:
        evaluator = SkillEvaluator()
        result = await evaluator.evaluate(
            target_job=request.target_job,
            user_skills=request.user_skills,
        )
        return result
    except Exception as e:
        logger.error("Skill evaluation failed: %s", e, exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Skill evaluation failed: {str(e)}",
        )
