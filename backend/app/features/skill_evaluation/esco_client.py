"""
ESCO REST API client.

Normalizes user-provided skill names against the European Skills/Competences
taxonomy.  The ESCO API is public — no authentication required.
"""

import asyncio
import logging

import httpx

logger = logging.getLogger(__name__)

ESCO_SEARCH_URL = "https://ec.europa.eu/esco/api/search"


class ESCOClient:
    """Normalizes skill names using the ESCO taxonomy."""

    async def normalize_skill(self, skill_name: str) -> dict:
        """
        Look up a single skill in ESCO and return its canonical name + category.

        Returns ``{"skill": "...", "category": "..."}``
        Falls back to the original name if the API fails or finds nothing.
        """
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.get(
                    ESCO_SEARCH_URL,
                    params={
                        "text": skill_name,
                        "type": "skill",
                        "language": "en",
                        "limit": 1,
                        "full": "false",
                    },
                )
                resp.raise_for_status()
                data = resp.json()

            results = data.get("_embedded", {}).get("results", [])
            if results:
                hit = results[0]
                preferred = hit.get("preferredLabel", {})
                canonical = preferred.get("en") or preferred.get("en-us") or hit.get("title", skill_name)
                category = hit.get("className", "Skill")
                return {"skill": canonical, "category": category}

        except Exception as e:
            logger.warning("ESCO lookup failed for '%s': %s", skill_name, e)

        return {"skill": skill_name, "category": ""}

    async def normalize_batch(self, skills: list[str]) -> list[dict]:
        """
        Normalize a list of skills concurrently.

        Returns ``[{"skill": "...", "category": "..."}, ...]``
        """
        if not skills:
            return []

        tasks = [self.normalize_skill(s) for s in skills]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        normalized: list[dict] = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                logger.warning("ESCO batch lookup failed for '%s': %s", skills[i], result)
                normalized.append({"skill": skills[i], "category": ""})
            else:
                normalized.append(result)

        return normalized
