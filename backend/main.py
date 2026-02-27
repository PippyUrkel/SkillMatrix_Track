import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.features.auth.routes import router as auth_router
from app.features.curriculum.routes import router as curriculum_router
from app.features.skill_analysis.routes import router as skill_analysis_router
from app.features.skill_evaluation.routes import router as skill_evaluation_router
from app.features.profile.routes import router as profile_router
from app.features.fl_engine.routes import router as fl_router
from app.features.fl_engine.orchestrator import get_orchestrator
from app.features.jobs.routes import router as jobs_router
from app.features.paid_courses.routes import router as paid_courses_router
from app.features.community.routes import router as community_router

logger = logging.getLogger(__name__)
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle for FastAPI."""
    # ── Startup ──
    if settings.fl_enabled:
        orchestrator = get_orchestrator()
        orchestrator.start()
        logger.info("FL Engine started with FastAPI")
    else:
        logger.info("FL Engine disabled via config")

    yield

    # ── Shutdown ──
    if settings.fl_enabled:
        orchestrator = get_orchestrator()
        orchestrator.stop()
        logger.info("FL Engine stopped")


app = FastAPI(
    title="SkillMatrix API",
    description="Skill Gap Analyser Backend",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth_router)
app.include_router(curriculum_router)
app.include_router(skill_analysis_router)
app.include_router(skill_evaluation_router)
app.include_router(profile_router)
app.include_router(fl_router)
app.include_router(jobs_router)
app.include_router(paid_courses_router)
app.include_router(community_router)


@app.get("/")
async def root():
    return {"message": "SkillMatrix API is running"}
