import json
import re
import logging

import httpx

from app.config import get_settings
from app.utils.llm import generate_text
from app.features.curriculum.schemas import (
    CurriculumRequest,
    CurriculumResponse,
    ModuleItem,
    VideoItem,
    PlacementReason,
)

logger = logging.getLogger(__name__)

YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search"
YOUTUBE_VIDEOS_URL = "https://www.googleapis.com/youtube/v3/videos"


# ──────────────────────────────────────────────
#  YouTube Service
# ──────────────────────────────────────────────


class YouTubeService:
    """Searches YouTube Data API v3 for tutorial videos."""

    def __init__(self, api_key: str):
        self.api_key = api_key

    async def search_videos(
        self,
        query: str,
        max_results: int = 6,
        max_duration_minutes: int = 20,
    ) -> list[dict]:
        """
        Search YouTube and return videos filtered by duration.

        Returns a list of dicts:
            {title, youtube_url, duration_minutes, channel}
        """
        if not self.api_key or self.api_key.startswith("your-"):
            logger.warning("No valid YouTube API key – returning empty results")
            return []

        async with httpx.AsyncClient(timeout=15) as client:
            # Step 1: search
            search_resp = await client.get(
                YOUTUBE_SEARCH_URL,
                params={
                    "part": "snippet",
                    "q": query,
                    "type": "video",
                    "maxResults": max_results * 2,  # over-fetch to allow filtering
                    "order": "relevance",
                    "videoDuration": "medium",  # 4-20 min
                    "key": self.api_key,
                },
            )
            search_resp.raise_for_status()
            items = search_resp.json().get("items", [])

            if not items:
                return []

            video_ids = [item["id"]["videoId"] for item in items]

            # Step 2: get real durations via /videos
            details_resp = await client.get(
                YOUTUBE_VIDEOS_URL,
                params={
                    "part": "contentDetails,snippet",
                    "id": ",".join(video_ids),
                    "key": self.api_key,
                },
            )
            details_resp.raise_for_status()
            details = details_resp.json().get("items", [])

        results: list[dict] = []
        seen_titles: set[str] = set()

        for vid in details:
            duration_min = _iso8601_to_minutes(
                vid["contentDetails"]["duration"]
            )
            title = vid["snippet"]["title"]

            # Filter: within duration cap and not duplicate
            if duration_min > max_duration_minutes or duration_min < 1:
                continue
            if title.lower() in seen_titles:
                continue
            seen_titles.add(title.lower())

            results.append(
                {
                    "title": title,
                    "youtube_url": f"https://www.youtube.com/watch?v={vid['id']}",
                    "duration_minutes": duration_min,
                    "channel": vid["snippet"]["channelTitle"],
                }
            )

            if len(results) >= max_results:
                break

        return results


# ──────────────────────────────────────────────
#  Curriculum Service  (Ollama-powered)
# ──────────────────────────────────────────────


class CurriculumService:
    """Orchestrates curriculum generation using Ollama + YouTube."""

    def __init__(self):
        settings = get_settings()
        self.youtube = YouTubeService(settings.youtube_api_key)

    # ── public entry point ──────────────────────

    async def generate_curriculum(
        self, request: CurriculumRequest
    ) -> CurriculumResponse:
        """Full pipeline: plan modules → fetch videos → assemble response."""

        # Step 1 – ask LLM to plan modules
        module_plan = await self._plan_modules(request)

        # Step 2 – for each planned module, search YouTube
        modules: list[ModuleItem] = []
        for idx, mod in enumerate(module_plan, start=1):
            videos = await self._fetch_videos_for_module(
                course_topic=request.course_topic,
                module_title=mod["title"],
                learning_objective=mod["objective"],
                daily_minutes=request.constraints.daily_time_minutes,
            )
            modules.append(
                ModuleItem(
                    module_number=idx,
                    module_title=mod["title"],
                    learning_objective=mod["objective"],
                    total_duration_minutes=sum(v.duration_minutes for v in videos),
                    videos=videos,
                )
            )

        return CurriculumResponse(
            course_title=f"{request.course_topic} — Personalized Course",
            level=request.user_profile.current_level,
            total_modules=len(modules),
            estimated_completion_days=request.constraints.target_course_duration_days,
            modules=modules,
        )

    # ── FL-powered curriculum adaptation ───────

    async def adapt_curriculum(
        self,
        module: ModuleItem,
        assessment: dict,
        course_topic: str,
    ) -> dict:
        """
        Adapt a curriculum module based on FL assessment results.

        If the student shows weak understanding → expand the module
        (more sub-topics, foundational content, extra explanations).

        If strong understanding → shorten it
        (condense, skip basics, advance faster).

        If partial → maintain with a practice exercise added.
        """
        recommendation = assessment.get("recommendation", "maintain")
        comprehension = assessment.get("comprehension_level", "partial")
        confidence = assessment.get("confidence", 50.0)

        if recommendation == "expand":
            return await self._expand_module(module, assessment, course_topic)
        elif recommendation == "shorten":
            return await self._shorten_module(module, assessment, course_topic)
        else:
            return await self._maintain_module(module, assessment, course_topic)

    async def _expand_module(
        self, module: ModuleItem, assessment: dict, course_topic: str
    ) -> dict:
        """Use LLM to expand a module for a struggling student."""
        prompt = f"""You are an expert teacher adapting course content for a struggling student.

COURSE TOPIC: {course_topic}
MODULE: {module.module_title}
LEARNING OBJECTIVE: {module.learning_objective}

STUDENT ASSESSMENT:
- Comprehension level: WEAK ({assessment.get('confidence', 0):.0f}% confidence)
- Weak areas: {', '.join(a['question'] for a in assessment.get('per_answer', []) if a.get('level') == 'weak')}

The student is struggling with this material. Break this module into 2-3 smaller sub-modules that:
1. Start with simpler foundational concepts
2. Add more worked examples and analogies
3. Build up gradually to the original objective
4. Include practice exercises between concepts

Return ONLY a valid JSON array (no markdown fences). Each element:
{{"title": "Sub-module Title", "objective": "Specific learning objective", "approach": "How this sub-module helps the struggling student"}}
"""
        response = await generate_text(prompt)
        sub_modules = self._parse_module_plan(response) if response else []

        if not sub_modules:
            sub_modules = [
                {"title": f"{module.module_title} — Fundamentals", "objective": f"Review basic concepts needed for {module.learning_objective}"},
                {"title": f"{module.module_title} — Deep Dive", "objective": module.learning_objective},
                {"title": f"{module.module_title} — Practice", "objective": f"Apply and reinforce {module.learning_objective}"},
            ]

        return {
            "action": "expand",
            "reason": f"Student showed weak understanding ({assessment.get('confidence', 0):.0f}% confidence). Expanding module into {len(sub_modules)} sub-modules for better comprehension.",
            "original_module": module.module_title,
            "adapted_modules": sub_modules,
        }

    async def _shorten_module(
        self, module: ModuleItem, assessment: dict, course_topic: str
    ) -> dict:
        """Use LLM to condense a module for an advanced student."""
        prompt = f"""You are an expert teacher adapting course content for an advanced student.

COURSE TOPIC: {course_topic}
MODULE: {module.module_title}
LEARNING OBJECTIVE: {module.learning_objective}

STUDENT ASSESSMENT:
- Comprehension level: STRONG ({assessment.get('confidence', 0):.0f}% confidence)

The student already understands this material well. Create a condensed version that:
1. Skips basic introductions
2. Focuses on advanced applications and edge cases
3. Adds challenging practice problems
4. Optionally introduces the next topic early

Return ONLY a valid JSON object (no markdown fences):
{{"condensed_title": "...", "condensed_objective": "Advanced: ...", "skip_topics": ["topics to skip"], "add_topics": ["advanced topics to add"]}}
"""
        response = await generate_text(prompt)
        condensed = None
        if response:
            import re as _re
            cleaned = _re.sub(r"```(?:json)?\s*", "", response).strip().rstrip("`")
            try:
                condensed = json.loads(cleaned)
            except json.JSONDecodeError:
                pass

        if not condensed:
            condensed = {
                "condensed_title": f"{module.module_title} — Advanced",
                "condensed_objective": f"Advanced applications of {module.learning_objective}",
                "skip_topics": ["basic introduction", "foundational concepts"],
                "add_topics": ["edge cases", "real-world applications"],
            }

        return {
            "action": "shorten",
            "reason": f"Student showed strong understanding ({assessment.get('confidence', 0):.0f}% confidence). Condensing module to advance faster.",
            "original_module": module.module_title,
            "adapted_module": condensed,
        }

    async def _maintain_module(
        self, module: ModuleItem, assessment: dict, course_topic: str
    ) -> dict:
        """Keep module as-is but add a practice exercise."""
        return {
            "action": "maintain",
            "reason": f"Student showed partial understanding ({assessment.get('confidence', 0):.0f}% confidence). Module maintained with additional practice recommended.",
            "original_module": module.module_title,
            "suggestion": "Review the material once more and attempt the practice exercises before moving on.",
        }

    # ── private helpers ─────────────────────────

    async def _plan_modules(self, request: CurriculumRequest) -> list[dict]:
        """Use Ollama to break the topic into ordered modules."""

        prompt = self._build_planning_prompt(request)

        try:
            response = await generate_text(prompt)
            if response:
                parsed = self._parse_module_plan(response)
                if parsed:
                    return parsed
        except Exception as e:
            logger.error("LLM planning failed: %s", e)

        return self._fallback_module_plan(request)

    def _build_planning_prompt(self, request: CurriculumRequest) -> str:
        return f"""You are an expert curriculum designer. Create a structured course plan.

COURSE TOPIC: {request.course_topic}
STUDENT LEVEL: {request.user_profile.current_level}
WEAK SKILLS (focus on these): {', '.join(request.user_profile.weak_subskills) or 'None specified'}
STRONG SKILLS (skip or review briefly): {', '.join(request.user_profile.strong_subskills) or 'None specified'}
TOTAL MODULES: {request.constraints.target_course_duration_days}
DAILY TIME BUDGET: {request.constraints.daily_time_minutes} minutes

RULES:
- Order modules from foundational to advanced
- Each module should be completable within the daily time budget
- Focus on weak skills; skip strong skills unless needed for continuity
- Each module needs a clear, specific learning objective
- Maintain progressive difficulty without conceptual jumps

Return ONLY a valid JSON array (no markdown fences). Each element:
{{"title": "Module Title", "objective": "One-sentence learning objective"}}

Example:
[{{"title": "Introduction to Recursion", "objective": "Understand how recursive functions work and trace their execution"}}]
"""

    def _parse_module_plan(self, text: str) -> list[dict]:
        """Extract JSON array from LLM response."""
        # Strip markdown code fences if present
        cleaned = re.sub(r"```(?:json)?\s*", "", text).strip().rstrip("`")
        # Try to find a JSON array in the response
        match = re.search(r"\[.*\]", cleaned, re.DOTALL)
        if match:
            cleaned = match.group(0)
        try:
            data = json.loads(cleaned)
            if isinstance(data, list) and all(
                "title" in m and "objective" in m for m in data
            ):
                return data
        except json.JSONDecodeError:
            logger.warning("Failed to parse LLM response as JSON")
        return []

    def _fallback_module_plan(self, request: CurriculumRequest) -> list[dict]:
        """Simple deterministic fallback when LLM is unavailable."""
        skills = request.user_profile.weak_subskills or [request.course_topic]
        days = request.constraints.target_course_duration_days
        modules = []
        for i in range(days):
            skill = skills[i % len(skills)]
            modules.append(
                {
                    "title": f"Module {i + 1}: {skill.title()}",
                    "objective": f"Understand and apply {skill} in {request.course_topic}",
                }
            )
        return modules

    async def _fetch_videos_for_module(
        self,
        course_topic: str,
        module_title: str,
        learning_objective: str,
        daily_minutes: int,
    ) -> list[VideoItem]:
        """Search YouTube and arrange videos for a single module."""

        query = f"{course_topic} {module_title} tutorial"
        max_per_video = min(daily_minutes // 3, 20)  # aim for 3-6 videos

        raw_videos = await self.youtube.search_videos(
            query=query,
            max_results=6,
            max_duration_minutes=max_per_video,
        )

        if not raw_videos:
            # Fallback placeholder videos
            return self._placeholder_videos(module_title, daily_minutes)

        # Try ordering with LLM, fall back to simple ordering
        try:
            ordered = await self._order_videos_with_llm(
                raw_videos, module_title, learning_objective, daily_minutes
            )
            if ordered:
                return ordered
        except Exception as e:
            logger.warning("LLM video ordering failed: %s", e)

        return self._order_videos_simple(raw_videos, daily_minutes)

    async def _order_videos_with_llm(
        self,
        raw_videos: list[dict],
        module_title: str,
        learning_objective: str,
        daily_minutes: int,
    ) -> list[VideoItem] | None:
        """Use LLM to pick the best videos and assign placement reasons."""

        videos_json = json.dumps(raw_videos, indent=2)
        prompt = f"""You are a curriculum designer. Select and order the best videos for this module.

MODULE: {module_title}
OBJECTIVE: {learning_objective}
TIME BUDGET: {daily_minutes} minutes total

AVAILABLE VIDEOS:
{videos_json}

RULES:
- Select 3-6 videos whose total duration fits within the time budget
- Order them: intro → concept → demo → practice
- Assign each a placement_reason: "intro", "concept", "demo", or "practice"
- Do not exceed the time budget
- Prefer diverse channels

Return ONLY a valid JSON array (no markdown fences). Each element:
{{"title": "...", "youtube_url": "...", "duration_minutes": N, "placement_reason": "intro|concept|demo|practice"}}
"""
        response = await generate_text(prompt)
        if not response:
            return None

        cleaned = re.sub(r"```(?:json)?\s*", "", response).strip().rstrip("`")
        match = re.search(r"\[.*\]", cleaned, re.DOTALL)
        if match:
            cleaned = match.group(0)

        try:
            data = json.loads(cleaned)
            videos = []
            for v in data:
                videos.append(
                    VideoItem(
                        title=v["title"],
                        youtube_url=v["youtube_url"],
                        duration_minutes=v["duration_minutes"],
                        placement_reason=PlacementReason(v["placement_reason"]),
                    )
                )
            return videos if videos else None
        except (json.JSONDecodeError, KeyError, ValueError) as e:
            logger.warning("Failed to parse LLM video ordering: %s", e)
            return None

    def _order_videos_simple(
        self, raw_videos: list[dict], daily_minutes: int
    ) -> list[VideoItem]:
        """Deterministic fallback: pick videos within budget, assign reasons."""
        reasons = [
            PlacementReason.intro,
            PlacementReason.concept,
            PlacementReason.concept,
            PlacementReason.demo,
            PlacementReason.demo,
            PlacementReason.practice,
        ]
        videos: list[VideoItem] = []
        total = 0
        for i, v in enumerate(raw_videos):
            if total + v["duration_minutes"] > daily_minutes:
                break
            videos.append(
                VideoItem(
                    title=v["title"],
                    youtube_url=v["youtube_url"],
                    duration_minutes=v["duration_minutes"],
                    placement_reason=reasons[min(i, len(reasons) - 1)],
                )
            )
            total += v["duration_minutes"]
        return videos

    def _placeholder_videos(
        self, module_title: str, daily_minutes: int
    ) -> list[VideoItem]:
        """Return placeholder videos when YouTube API is unavailable."""
        placeholders = [
            ("Introduction", PlacementReason.intro),
            ("Core Concepts", PlacementReason.concept),
            ("Worked Example", PlacementReason.demo),
            ("Practice Exercise", PlacementReason.practice),
        ]
        per_video = daily_minutes // len(placeholders)
        return [
            VideoItem(
                title=f"{module_title} – {label}",
                youtube_url="https://www.youtube.com/results?search_query="
                + module_title.replace(" ", "+"),
                duration_minutes=per_video,
                placement_reason=reason,
            )
            for label, reason in placeholders
        ]


# ──────────────────────────────────────────────
#  Utilities
# ──────────────────────────────────────────────


def _iso8601_to_minutes(duration: str) -> int:
    """Convert ISO 8601 duration (PT12M34S) to whole minutes."""
    match = re.match(r"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", duration)
    if not match:
        return 0
    hours = int(match.group(1) or 0)
    minutes = int(match.group(2) or 0)
    seconds = int(match.group(3) or 0)
    return hours * 60 + minutes + (1 if seconds >= 30 else 0)
