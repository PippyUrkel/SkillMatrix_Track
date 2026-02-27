"""
Core skill gap evaluation engine.

Implements the 4-step process:
  1. Normalize user skills via ESCO
  2. Gap-score against O*NET role requirements
  3. Deduplicate with canonical naming
  4. Recommend courses via LLM
"""

import json
import logging
import re

from app.utils.llm import generate_text
from app.features.skill_evaluation.onet_client import ONetClient
from app.features.skill_evaluation.esco_client import ESCOClient
from app.features.skill_evaluation.schemas import SkillEvaluationResponse

logger = logging.getLogger(__name__)

IMPORTANCE_THRESHOLD = 60  # skills with importance >= 60 and missing → weak


class SkillEvaluator:
    """Orchestrates the full skill gap evaluation pipeline."""

    def __init__(self) -> None:
        self.onet = ONetClient()
        self.esco = ESCOClient()

    async def evaluate(
        self, target_job: str, user_skills: list[str]
    ) -> SkillEvaluationResponse:

        # STEP 1 — Fetch role requirements + normalize user skills
        onet_role_skills = await self.onet.get_role_skills(target_job)
        esco_normalized = await self.esco.normalize_batch(user_skills)

        # Build canonical user‐skill set (lowercase)
        user_canonical: set[str] = set()
        for norm in esco_normalized:
            user_canonical.add(norm["skill"].lower().strip())
        # Also add the raw skills as-is for fuzzy matching
        for raw in user_skills:
            user_canonical.add(raw.lower().strip())

        # STEP 2 — Gap scoring
        strong: list[str] = []
        weak: list[str] = []

        for role_skill in onet_role_skills:
            name = role_skill["skill"]
            importance = role_skill["importance"]
            name_lower = name.lower().strip()

            # Check if user has this skill (exact or substring match)
            has_skill = self._user_has_skill(name_lower, user_canonical)

            if has_skill:
                strong.append(name_lower)
            elif importance >= IMPORTANCE_THRESHOLD:
                weak.append(name_lower)
            # else: importance < 60 and missing → ignore

        # Also mark user skills not in role requirements as strong
        role_skill_names = {s["skill"].lower().strip() for s in onet_role_skills}
        for us in user_canonical:
            if us not in role_skill_names and us not in strong:
                strong.append(us)

        # STEP 3 — Deduplicate
        strong = self._deduplicate(strong)
        weak = self._deduplicate(weak)

        # Remove anything from weak that's also in strong
        strong_set = set(strong)
        weak = [w for w in weak if w not in strong_set]

        # STEP 4 — Course recommendations
        courses = await self._recommend_courses(target_job, weak)

        return SkillEvaluationResponse(
            target_job=target_job,
            strong_subskills=strong,
            weak_subskills=weak,
            recommended_courses=courses,
        )

    # ── helpers ─────────────────────────────────

    @staticmethod
    def _user_has_skill(role_skill: str, user_skills: set[str]) -> bool:
        """Check if the user possesses a required skill (fuzzy match)."""
        if role_skill in user_skills:
            return True
        # Substring match in either direction
        for us in user_skills:
            if role_skill in us or us in role_skill:
                return True
        return False

    @staticmethod
    def _deduplicate(skills: list[str]) -> list[str]:
        """Remove duplicates while preserving order."""
        seen: set[str] = set()
        result: list[str] = []
        for s in skills:
            canonical = s.lower().strip()
            if canonical and canonical not in seen:
                seen.add(canonical)
                result.append(canonical)
        return result

    async def _recommend_courses(
        self, target_job: str, weak_skills: list[str]
    ) -> list[str]:
        """Use LLM to generate 3 course recommendations targeting weak skills."""
        if not weak_skills:
            return [
                f"Advanced {target_job} Mastery",
                f"Leadership Skills for {target_job}s",
                f"Emerging Technologies in {target_job.split()[0] if target_job.split() else 'Tech'}",
            ]

        weak_list = ", ".join(weak_skills)
        prompt = f"""You are an expert career development advisor.

TARGET JOB: {target_job}
SKILL GAPS (weak skills the user is missing): {weak_list}

Generate exactly 3 course titles that:
- Target multiple weak skills where possible
- Sound like real professional learning platform course titles
- Are specifically aligned to the target job
- Are actionable and specific (not generic)

Return ONLY a valid JSON array of 3 strings (no markdown fences):
["Course Title 1", "Course Title 2", "Course Title 3"]
"""
        response = await generate_text(prompt)
        if response:
            cleaned = re.sub(r"```(?:json)?\s*", "", response).strip().rstrip("`")
            match = re.search(r"\[.*\]", cleaned, re.DOTALL)
            if match:
                cleaned = match.group(0)
            try:
                courses = json.loads(cleaned)
                if isinstance(courses, list) and len(courses) >= 1:
                    return [str(c) for c in courses[:3]]
            except (json.JSONDecodeError, TypeError):
                logger.warning("Failed to parse LLM course recommendations")

        # Fallback: generate simple course titles from weak skills
        return [
            f"Mastering {weak_skills[0].title()} for {target_job}s",
            f"Essential {weak_skills[min(1, len(weak_skills)-1)].title()} Skills",
            f"Professional {target_job} Development Bootcamp",
        ]
