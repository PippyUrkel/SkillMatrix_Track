"""
Service layer that fetches real job listings from free public APIs,
scores them against the user's skills, and returns the best matches.

Sources:
  - Remotive (remote jobs worldwide, includes India) — no API key required
    GET https://remotive.com/api/remote-jobs

No API keys required for any source.
"""

import hashlib
import logging
import re

import httpx

from .schemas import JobItem

logger = logging.getLogger(__name__)

REMOTIVE_URL = "https://remotive.com/api/remote-jobs"


async def _fetch_remotive_jobs(limit: int = 200) -> list[dict]:
    """Fetch remote job listings from Remotive."""
    all_jobs: list[dict] = []
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(REMOTIVE_URL, params={"limit": limit})
            resp.raise_for_status()
            data = resp.json()
            all_jobs = data.get("jobs", [])
    except Exception as e:
        logger.error("Failed to fetch Remotive jobs: %s", e)
    return all_jobs


def _normalise(text: str) -> str:
    """Lower-case and strip non-alphanumeric characters for matching."""
    return re.sub(r"[^a-z0-9\s+#.]", "", text.lower())


def _score_job(job: dict, user_skills: list[str]) -> JobItem | None:
    """
    Compute a fit score for a single job against the user's skills.

    Returns None if there is zero skill overlap (irrelevant job).
    """
    title = job.get("title", "")
    company = job.get("company_name", "") or job.get("company", "")
    description = job.get("description", "")
    tags = job.get("tags", []) or []
    location = job.get("candidate_required_location", "") or "Anywhere"
    url = job.get("url", "")
    job_type_raw = job.get("job_type", "")
    salary = job.get("salary", "") or ""

    # Build a searchable blob from the job
    searchable = _normalise(f"{title} {description} {' '.join(tags)}")

    # Normalise user skills
    normalised_skills = [_normalise(s) for s in user_skills]

    matched: list[str] = []
    missing: list[str] = []

    for raw, norm in zip(user_skills, normalised_skills):
        if norm in searchable:
            matched.append(raw)
        else:
            missing.append(raw)

    # Skip jobs with zero matches — not relevant
    if not matched:
        return None

    # Fit score = % of user skills that match, scaled to 0-100
    fit_score = int((len(matched) / max(len(user_skills), 1)) * 100)

    # Determine job type
    jt = job_type_raw.lower() if job_type_raw else ""
    if "contract" in jt:
        display_type = "contract"
    elif "full" in jt:
        display_type = "remote"
    elif "part" in jt:
        display_type = "remote"
    else:
        display_type = "remote"

    # Determine experience level from title
    title_lower = title.lower()
    if "senior" in title_lower or "lead" in title_lower or "principal" in title_lower or "staff" in title_lower:
        experience = "Senior"
    elif "junior" in title_lower or "intern" in title_lower or "entry" in title_lower:
        experience = "Junior"
    else:
        experience = "Mid"

    # Strip HTML tags from description for a clean snippet
    clean_desc = re.sub(r"<[^>]+>", " ", description)
    clean_desc = re.sub(r"\s+", " ", clean_desc).strip()
    if salary:
        clean_desc = f"💰 {salary}\n\n{clean_desc}"
    if len(clean_desc) > 500:
        clean_desc = clean_desc[:497] + "..."

    # Stable unique ID
    stable_id = hashlib.md5((url or title + company).encode()).hexdigest()[:12]

    return JobItem(
        id=f"rm-{stable_id}",
        title=title,
        company=company,
        location=location if location else "Remote",
        type=display_type,
        description=clean_desc,
        fitScore=fit_score,
        matchedSkills=matched,
        missingSkills=missing,
        experienceLevel=experience,
        source="remotive",
        saved=False,
        url=url,
    )


async def search_jobs(skills: list[str], max_results: int = 20) -> list[JobItem]:
    """
    Fetch jobs from Remotive, score them against the given skills,
    and return the top matches sorted by fitScore descending.
    """
    if not skills:
        return []

    raw_jobs = await _fetch_remotive_jobs(limit=250)
    logger.info("Fetched %d raw jobs from Remotive", len(raw_jobs))

    scored: list[JobItem] = []
    for job in raw_jobs:
        item = _score_job(job, skills)
        if item is not None:
            scored.append(item)

    # Sort by fit score descending
    scored.sort(key=lambda j: j.fitScore, reverse=True)

    return scored[:max_results]
