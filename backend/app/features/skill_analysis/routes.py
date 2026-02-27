from fastapi import APIRouter, HTTPException

from app.features.skill_analysis.schemas import (
    GitHubAnalysisRequest,
    ResumeAnalysisRequest,
    TextAnalysisRequest,
    SkillGapReport,
)
from app.features.skill_analysis.github_scraper import GitHubScraper
from app.features.skill_analysis.resume_parser import ResumeParser
from app.features.skill_analysis.analyzer import SkillAnalyzer

router = APIRouter(prefix="/api/skills", tags=["skill-analysis"])


# ---------- Routes ----------


@router.post("/analyze/github", response_model=SkillGapReport)
async def analyze_github(body: GitHubAnalysisRequest):
    """
    Analyze a GitHub profile to extract skills and generate a skill gap report.

    Scrapes the user's public GitHub profile (repos, languages, activity)
    and uses Gemini to produce a structured skill assessment.
    """
    try:
        scraper = GitHubScraper()
        github_data = await scraper.scrape_profile(body.github_username)

        analyzer = SkillAnalyzer()
        report = await analyzer.analyze_github(github_data, body.target_role)
        return report
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"GitHub analysis failed: {e}")


@router.post("/analyze/resume", response_model=SkillGapReport)
async def analyze_resume(body: ResumeAnalysisRequest):
    """
    Analyze resume text to extract skills and generate a skill gap report.

    Parses the resume for known skill keywords and sections, then uses
    Gemini to produce a structured skill assessment.
    """
    try:
        parser = ResumeParser()
        parsed = parser.extract_skills(body.resume_text)

        analyzer = SkillAnalyzer()
        report = await analyzer.analyze_resume(parsed, body.target_role)
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Resume analysis failed: {e}")


@router.post("/analyze/text", response_model=SkillGapReport)
async def analyze_text(body: TextAnalysisRequest):
    """
    Analyze free-form profile text (e.g. LinkedIn summary) and generate
    a skill gap report.
    """
    try:
        analyzer = SkillAnalyzer()
        report = await analyzer.analyze_text(
            body.profile_text, body.source, body.target_role
        )
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Text analysis failed: {e}")
