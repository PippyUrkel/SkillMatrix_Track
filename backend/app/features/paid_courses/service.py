"""
Paid course recommendation service.

Uses the local LLM (Ollama) to generate course recommendations from
Coursera, Udemy, and edX. Each recommendation includes a direct search
link to the platform so users can find and enroll.
"""

import json
import logging
import urllib.parse

from app.utils.llm import generate_text
from app.features.paid_courses.schemas import PaidCourseItem

logger = logging.getLogger(__name__)

# ─── Platform URL builders ─────────────────────────────────────────────────────

PLATFORM_SEARCH_URLS = {
    "Coursera": "https://www.coursera.org/search?query={q}",
    "Udemy": "https://www.udemy.com/courses/search/?q={q}",
    "edX": "https://www.edx.org/search?q={q}",
}


def build_course_url(platform: str, course_title: str) -> str:
    """Build a search URL for the given platform and course title."""
    template = PLATFORM_SEARCH_URLS.get(platform, PLATFORM_SEARCH_URLS["Udemy"])
    return template.format(q=urllib.parse.quote_plus(course_title))


# ─── LLM prompt ───────────────────────────────────────────────────────────────

PROMPT_TEMPLATE = """You are a course recommendation engine. Given a topic and skill level,
recommend exactly {count} paid online courses from real platforms.

Topic: {topic}
Skill Level: {level}

Return ONLY a JSON array. Each item must have these exact keys:
- "title": string (a realistic course name)
- "platform": one of "Coursera", "Udemy", or "edX"
- "description": string (1-2 sentence summary)
- "estimated_price": string (e.g., "$12.99", "$49/month", "Free (audit)")
- "difficulty": one of "beginner", "intermediate", "advanced"
- "estimated_duration": string (e.g., "4 weeks", "12 hours")
- "rating": number between 3.5 and 5.0

Rules:
- Include 2 courses from each platform (Coursera, Udemy, edX)
- Use realistic pricing: Udemy ($10-$90), Coursera ($39-$79/month or specialization), edX (Free audit or $50-$300 verified)
- Vary difficulty levels around the requested level
- Output ONLY the JSON array, no markdown, no explanation

JSON:"""


async def generate_paid_recommendations(
    topic: str,
    skill_level: str = "beginner",
    max_results: int = 6,
) -> list[PaidCourseItem]:
    """
    Ask the LLM for paid course recommendations and parse the response.
    Falls back to search-link-only recommendations if LLM fails.
    """
    prompt = PROMPT_TEMPLATE.format(
        count=max_results,
        topic=topic,
        level=skill_level,
    )

    raw = await generate_text(prompt, temperature=0.4)

    if not raw:
        logger.warning("LLM returned empty — using fallback recommendations")
        return _fallback_recommendations(topic, skill_level)

    try:
        # Try to parse JSON from the response
        courses_data = _parse_json_array(raw)
        items = []
        for c in courses_data[:max_results]:
            platform = c.get("platform", "Udemy")
            title = c.get("title", f"{topic} Course")
            items.append(PaidCourseItem(
                title=title,
                platform=platform,
                description=c.get("description", f"Learn {topic} on {platform}"),
                estimated_price=c.get("estimated_price", "$29.99"),
                url=build_course_url(platform, title),
                difficulty=c.get("difficulty", skill_level),
                estimated_duration=c.get("estimated_duration", "4 weeks"),
                rating=float(c.get("rating", 4.5)),
            ))
        return items if items else _fallback_recommendations(topic, skill_level)
    except Exception as e:
        logger.error(f"Failed to parse LLM response: {e}")
        return _fallback_recommendations(topic, skill_level)


def _parse_json_array(text: str) -> list[dict]:
    """Extract a JSON array from possibly messy LLM output."""
    # Try direct parse first
    text = text.strip()
    try:
        result = json.loads(text)
        if isinstance(result, list):
            return result
    except json.JSONDecodeError:
        pass

    # Try to find array brackets
    start = text.find("[")
    end = text.rfind("]")
    if start != -1 and end != -1 and end > start:
        try:
            result = json.loads(text[start:end + 1])
            if isinstance(result, list):
                return result
        except json.JSONDecodeError:
            pass

    # Try json_repair if available
    try:
        from json_repair import repair_json
        repaired = repair_json(text, return_objects=True)
        if isinstance(repaired, list):
            return repaired
    except ImportError:
        pass

    return []


def _fallback_recommendations(topic: str, skill_level: str) -> list[PaidCourseItem]:
    """Generate basic search-link recommendations when LLM is unavailable."""
    platforms = [
        ("Coursera", "$49/month", "4 weeks"),
        ("Coursera", "$39/month", "6 weeks"),
        ("Udemy", "$14.99", "12 hours"),
        ("Udemy", "$19.99", "18 hours"),
        ("edX", "Free (audit) / $149 verified", "8 weeks"),
        ("edX", "Free (audit) / $99 verified", "5 weeks"),
    ]

    items = []
    for i, (platform, price, duration) in enumerate(platforms):
        title = f"{topic} — {skill_level.title()} Course ({platform})"
        items.append(PaidCourseItem(
            title=title,
            platform=platform,
            description=f"Search {platform} for {skill_level} {topic} courses",
            estimated_price=price,
            url=build_course_url(platform, topic),
            difficulty=skill_level,
            estimated_duration=duration,
            rating=4.5,
        ))
    return items
