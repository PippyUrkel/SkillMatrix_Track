import logging
from fastapi import APIRouter, HTTPException

from app.features.paid_courses.schemas import (
    PaidCourseRequest,
    PaidCourseResponse,
)
from app.features.paid_courses.service import generate_paid_recommendations

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/courses", tags=["Paid Courses"])


@router.post("/paid", response_model=PaidCourseResponse)
async def get_paid_courses(body: PaidCourseRequest):
    """
    Generate paid course recommendations from Coursera, Udemy, and edX.

    Uses the local LLM to produce realistic recommendations with
    direct search links to each platform.
    """
    try:
        courses = await generate_paid_recommendations(
            topic=body.topic,
            skill_level=body.skill_level,
            max_results=body.max_results,
        )
        return PaidCourseResponse(topic=body.topic, courses=courses)
    except Exception as e:
        logger.error(f"Paid course generation failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate paid course recommendations: {e}",
        )
