"""Routes for the jobs feature."""

from fastapi import APIRouter

from .schemas import JobSearchRequest, JobItem
from .service import search_jobs

router = APIRouter(prefix="/api/jobs", tags=["jobs"])


@router.post("/search", response_model=list[JobItem])
async def search_jobs_endpoint(body: JobSearchRequest):
    """
    Search for real job listings that match the given skills.

    The endpoint fetches listings from the Arbeitnow public API,
    scores each one against the provided skills, and returns
    the best matches sorted by fit score.
    """
    results = await search_jobs(body.skills)
    return results
