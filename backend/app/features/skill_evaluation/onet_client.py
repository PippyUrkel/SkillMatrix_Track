"""
O*NET Web Services client.

Searches for occupations and retrieves their required skills with importance
scores.  Falls back to LLM-based estimation when credentials are missing or
the API is unreachable.
"""

import json
import logging
import re
from base64 import b64encode

import httpx

from app.config import get_settings
from app.utils.llm import generate_text

logger = logging.getLogger(__name__)

ONET_BASE = "https://services.onetcenter.org/ws"


class ONetClient:
    """Fetches occupation skill requirements from O*NET."""

    def __init__(self) -> None:
        settings = get_settings()
        self.username = getattr(settings, "onet_username", "") or ""
        self.password = getattr(settings, "onet_password", "") or ""

    @property
    def _has_credentials(self) -> bool:
        return bool(self.username and self.password)

    def _auth_header(self) -> dict[str, str]:
        token = b64encode(f"{self.username}:{self.password}".encode()).decode()
        return {
            "Authorization": f"Basic {token}",
            "Accept": "application/json",
        }

    # ── public API ──────────────────────────────

    async def get_role_skills(self, job_title: str) -> list[dict]:
        """
        Return required skills for *job_title*.

        Each element: ``{"skill": str, "importance": 0-100}``
        """
        if not self._has_credentials:
            logger.info("No O*NET credentials – using LLM fallback")
            return await self._llm_fallback(job_title)

        try:
            soc_code = await self._search_occupation(job_title)
            if not soc_code:
                logger.warning("No O*NET occupation found for '%s'", job_title)
                return await self._llm_fallback(job_title)
            return await self._fetch_skills(soc_code)
        except Exception as e:
            logger.error("O*NET request failed: %s", e)
            return await self._llm_fallback(job_title)

    # ── private helpers ─────────────────────────

    async def _search_occupation(self, keyword: str) -> str | None:
        """Search O*NET for the best-matching SOC code."""
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                f"{ONET_BASE}/online/search",
                params={"keyword": keyword, "start": 1, "end": 5},
                headers=self._auth_header(),
            )
            resp.raise_for_status()
            data = resp.json()

        occupations = data.get("occupation", [])
        if not occupations:
            return None
        # Return the first match's SOC code
        return occupations[0].get("code")

    async def _fetch_skills(self, soc_code: str) -> list[dict]:
        """Get skills for a specific O*NET SOC code."""
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                f"{ONET_BASE}/online/occupations/{soc_code}/summary/skills",
                headers=self._auth_header(),
            )
            resp.raise_for_status()
            data = resp.json()

        skills: list[dict] = []
        for elem in data.get("element", []):
            name = elem.get("name", "")
            # O*NET importance is on a 1-5 scale; normalize to 0-100
            score_obj = elem.get("score", {})
            raw_value = float(score_obj.get("value", 0))
            importance = round((raw_value / 5.0) * 100, 1)
            if name:
                skills.append({"skill": name, "importance": importance})

        return skills

    # ── LLM fallback ────────────────────────────

    async def _llm_fallback(self, job_title: str) -> list[dict]:
        """Ask the local LLM to estimate required skills for a role."""
        prompt = f"""You are an expert career advisor. For the job role "{job_title}",
list the 10-15 most important technical and professional skills required.

Return ONLY a valid JSON array (no markdown fences). Each element:
{{"skill": "Skill Name", "importance": 0-100}}

importance should reflect how critical the skill is for the role (100 = essential,
60 = important, 30 = nice-to-have).

Example:
[{{"skill": "Python", "importance": 90}}, {{"skill": "SQL", "importance": 85}}]
"""
        response = await generate_text(prompt)
        if not response:
            return self._hardcoded_fallback(job_title)

        cleaned = re.sub(r"```(?:json)?\s*", "", response).strip().rstrip("`")
        match = re.search(r"\[.*\]", cleaned, re.DOTALL)
        if match:
            cleaned = match.group(0)
        try:
            data = json.loads(cleaned)
            return [
                {"skill": s["skill"], "importance": float(s["importance"])}
                for s in data
                if "skill" in s and "importance" in s
            ]
        except (json.JSONDecodeError, KeyError, TypeError):
            logger.warning("Failed to parse LLM O*NET fallback")
            return self._hardcoded_fallback(job_title)

    @staticmethod
    def _hardcoded_fallback(job_title: str) -> list[dict]:
        """Last-resort: generic software skills."""
        return [
            {"skill": "Programming", "importance": 90},
            {"skill": "Problem Solving", "importance": 85},
            {"skill": "Software Design", "importance": 80},
            {"skill": "Communication", "importance": 75},
            {"skill": "Data Analysis", "importance": 70},
            {"skill": "Database Management", "importance": 65},
            {"skill": "Version Control", "importance": 60},
            {"skill": "Testing", "importance": 60},
            {"skill": "Documentation", "importance": 50},
            {"skill": "Project Management", "importance": 45},
        ]
