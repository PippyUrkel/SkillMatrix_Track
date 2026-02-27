import json
import re
import logging

from json_repair import repair_json

from app.utils.llm import generate_text
from app.features.skill_analysis.schemas import (
    DataSource,
    SkillDetail,
    SkillGapReport,
    SkillLevel,
)

logger = logging.getLogger(__name__)

# Proficiency thresholds for classification
THRESHOLD_HIGH = 0.7
THRESHOLD_LOW = 0.4


class SkillAnalyzer:
    """
    Core intelligence layer that uses a local Ollama LLM to extract skills,
    estimate proficiency, and produce structured skill gap reports.
    """

    # ── public entry points ─────────────────────

    async def analyze_github(
        self, github_data: dict, target_role: str
    ) -> SkillGapReport:
        """Analyze scraped GitHub profile data."""
        prompt = self._build_github_prompt(github_data, target_role)
        return await self._run_analysis(prompt, DataSource.github, target_role)

    async def analyze_resume(
        self, parsed_resume: dict, target_role: str
    ) -> SkillGapReport:
        """Analyze parsed resume data."""
        prompt = self._build_resume_prompt(parsed_resume, target_role)
        return await self._run_analysis(prompt, DataSource.resume, target_role)

    async def analyze_text(
        self, profile_text: str, source: str, target_role: str
    ) -> SkillGapReport:
        """Analyze free-form profile text (LinkedIn, portfolio, etc.)."""
        prompt = self._build_text_prompt(profile_text, source, target_role)
        data_source = DataSource.linkedin if "linkedin" in source.lower() else DataSource.text
        return await self._run_analysis(prompt, data_source, target_role)

    # ── analysis pipeline ───────────────────────

    async def _run_analysis(
        self, prompt: str, source: DataSource, target_role: str
    ) -> SkillGapReport:
        """Send prompt to Ollama, parse the response into a SkillGapReport."""
        try:
            response = await generate_text(prompt)
            if response:
                return self._parse_response(response, source, target_role)
        except Exception as e:
            logger.error("LLM analysis failed: %s", e)

        return self._fallback_report(source, target_role)

    def _parse_response(
        self, text: str, source: DataSource, target_role: str
    ) -> SkillGapReport:
        """Extract structured JSON from LLM response."""
        # Strip <think> tags and their contents
        cleaned = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL).strip()

        # Strip markdown fences
        cleaned = re.sub(r"```(?:json)?\s*", "", cleaned).strip().rstrip("`")

        # Extract the outermost JSON object — find first { and matching last }
        start = cleaned.find("{")
        end = cleaned.rfind("}")
        if start != -1 and end != -1 and end > start:
            cleaned = cleaned[start : end + 1]

        # Fix common trailing comma issues before closing brace/bracket
        cleaned = re.sub(r",\s*([\]}])", r"\1", cleaned)

        data = None
        # 1. Try strict JSON parse first
        try:
            data = json.loads(cleaned)
        except json.JSONDecodeError as e:
            logger.warning("Strict JSON parse failed (%s), attempting repair...", e)
            # 2. Fall back to json_repair for common LLM quirks
            try:
                repaired = repair_json(cleaned, return_objects=True)
                if isinstance(repaired, dict):
                    data = repaired
                elif isinstance(repaired, list):
                    # json_repair sometimes wraps in a list when extra text follows
                    dict_items = [item for item in repaired if isinstance(item, dict)]
                    if dict_items:
                        data = dict_items[0]
                        logger.warning("json_repair returned list — using first dict element")
                    else:
                        logger.warning("json_repair list contained no dicts: %s", repaired)
                else:
                    logger.warning("json_repair returned unexpected type: %s", type(repaired))
            except Exception as repair_err:
                logger.warning("json_repair also failed: %s", repair_err)

        if data is None:
            logger.error(
                "Could not parse LLM JSON after repair — using fallback\nRaw text: %.300s", cleaned
            )
            return self._fallback_report(source, target_role)

        # Build skill details
        all_skills: list[SkillDetail] = []
        strong: list[str] = []
        weak: list[str] = []

        for skill_data in data.get("skills", []):
            score = float(skill_data.get("proficiency_score", 0.5))
            score = max(0.0, min(1.0, score))  # clamp

            if score >= THRESHOLD_HIGH:
                level = SkillLevel.strong
                strong.append(skill_data["name"])
            elif score <= THRESHOLD_LOW:
                level = SkillLevel.weak
                weak.append(skill_data["name"])
            else:
                level = SkillLevel.moderate

            all_skills.append(
                SkillDetail(
                    name=skill_data["name"],
                    proficiency_score=round(score, 2),
                    level=level,
                    evidence=skill_data.get("evidence", ""),
                )
            )

        current_level = data.get("current_level", "beginner")
        confidence = float(data.get("confidence_score", 0.5))

        return SkillGapReport(
            current_level=current_level,
            strong_subskills=strong,
            weak_subskills=weak,
            all_skills=all_skills,
            confidence_score=round(max(0.0, min(1.0, confidence)), 2),
            inferred_from=source,
            target_role=target_role,
        )

    # ── prompt builders ─────────────────────────

    def _build_github_prompt(self, github_data: dict, target_role: str) -> str:
        profile = github_data.get("profile", {})
        repos = github_data.get("repos", [])
        languages = github_data.get("languages", {})

        repos_summary = "\n".join(
            f"- {r['name']}: {r.get('description', 'N/A')} "
            f"(lang: {r.get('language', 'N/A')}, stars: {r.get('stars', 0)}, "
            f"topics: {', '.join(r.get('topics', []))})"
            for r in repos[:20]
        )

        return f"""You are a skill assessment expert. Analyze this GitHub profile and produce a skill gap report.

TARGET ROLE: {target_role}

GITHUB PROFILE:
- Name: {profile.get('name', 'N/A')}
- Bio: {profile.get('bio', 'N/A')}
- Company: {profile.get('company', 'N/A')}
- Public repos: {profile.get('public_repos', 0)}
- Followers: {profile.get('followers', 0)}
- Account created: {profile.get('created_at', 'N/A')}

LANGUAGES (repos count): {json.dumps(languages)}

TOP REPOSITORIES:
{repos_summary}

TOTAL STARS: {github_data.get('total_stars', 0)}
RECENT REPOS (2025+): {github_data.get('recent_repos', 0)}

{self._common_instructions()}
"""

    def _build_resume_prompt(self, parsed_resume: dict, target_role: str) -> str:
        keyword_skills = parsed_resume.get("keyword_skills", [])
        sections = parsed_resume.get("sections", {})
        raw_text = parsed_resume.get("raw_text", "")

        sections_text = "\n\n".join(
            f"### {name.upper()}\n{content}"
            for name, content in sections.items()
        )

        return f"""You are a skill assessment expert. Analyze this resume and produce a skill gap report.

TARGET ROLE: {target_role}

DETECTED KEYWORD SKILLS: {', '.join(keyword_skills) if keyword_skills else 'None detected'}

RESUME SECTIONS:
{sections_text if sections_text else 'No sections detected'}

FULL RESUME TEXT:
{raw_text[:5000]}

{self._common_instructions()}
"""

    def _build_text_prompt(self, profile_text: str, source: str, target_role: str) -> str:
        return f"""You are a skill assessment expert. Analyze this {source} profile text and produce a skill gap report.

TARGET ROLE: {target_role}

PROFILE TEXT:
{profile_text[:5000]}

{self._common_instructions()}
"""

    def _common_instructions(self) -> str:
        return """TASK: Extract skills and assess proficiency for the TARGET ROLE.

Rules:
- Score each skill 0.0 (none) to 1.0 (expert) based on evidence in the data.
- Classify overall level: "beginner", "intermediate", or "advanced".
- confidence_score: how reliable is this assessment (0.0-1.0).

CRITICAL: Reply with ONLY the JSON below. No explanation, no markdown fences, no extra text.

{
  "current_level": "beginner",
  "confidence_score": 0.7,
  "skills": [
    {"name": "Python", "proficiency_score": 0.8, "evidence": "Multiple Python repos"},
    {"name": "Git", "proficiency_score": 0.6, "evidence": "Active GitHub usage"}
  ]
}"""

    # ── fallback ────────────────────────────────

    def _fallback_report(self, source: DataSource, target_role: str) -> SkillGapReport:
        """Return a minimal report when LLM is unavailable."""
        return SkillGapReport(
            current_level="beginner",
            strong_subskills=[],
            weak_subskills=[],
            all_skills=[],
            confidence_score=0.0,
            inferred_from=source,
            target_role=target_role,
        )
