"""
Appwrite persistence helpers for generated curricula.
"""
import json
import logging
from datetime import datetime, timezone

from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.query import Query
from appwrite.id import ID
from appwrite.exception import AppwriteException

from app.config import get_settings
from app.features.curriculum.schemas import CurriculumResponse

logger = logging.getLogger(__name__)


def _db_client() -> tuple[Databases, str, str]:
    """Returns (Databases service, db_id, collection_id)."""
    settings = get_settings()
    client = Client()
    client.set_endpoint(settings.appwrite_endpoint)
    client.set_project(settings.appwrite_project_id)
    client.set_key(settings.appwrite_api_key)
    db = Databases(client)
    return db, settings.appwrite_database_id, settings.appwrite_curricula_collection_id


def save_curriculum(user_id: str, topic: str, curriculum: CurriculumResponse) -> str:
    """Persist a generated curriculum to Appwrite. Returns the new document ID."""
    db, db_id, coll_id = _db_client()
    doc_id = ID.unique()
    try:
        db.create_document(
            database_id=db_id,
            collection_id=coll_id,
            document_id=doc_id,
            data={
                "user_id": user_id,
                "course_title": curriculum.course_title,
                "level": curriculum.level,
                "topic": topic,
                "total_modules": curriculum.total_modules,
                "estimated_completion_days": curriculum.estimated_completion_days,
                "modules_json": json.dumps(curriculum.model_dump()["modules"]),
                "created_at_ts": datetime.now(timezone.utc).isoformat(),
            },
        )
    except AppwriteException as e:
        logger.error("Failed to save curriculum to Appwrite: %s", e)
        raise
    return doc_id


def list_curricula(user_id: str) -> list[dict]:
    """Return lightweight curriculum summaries for the user, including progress."""
    db, db_id, coll_id = _db_client()
    try:
        resp = db.list_documents(
            database_id=db_id,
            collection_id=coll_id,
            queries=[Query.equal("user_id", user_id), Query.order_desc("$createdAt")],
        )
        summaries = []
        for doc in resp.get("documents", []):
            # Parse stored progress and lesson structure for accurate %
            completed: list[str] = json.loads(doc.get("progress_json", "[]") or "[]")
            modules: list[dict] = json.loads(doc.get("modules_json", "[]") or "[]")
            total_lessons = sum(len(m.get("videos", [])) for m in modules)
            done_lessons = len(completed)
            progress_percent = (
                round((done_lessons / total_lessons) * 100)
                if total_lessons > 0
                else 0
            )
            summaries.append(
                {
                    "id": doc["$id"],
                    "course_title": doc["course_title"],
                    "topic": doc["topic"],
                    "level": doc["level"],
                    "total_modules": doc["total_modules"],
                    "total_lessons": total_lessons,
                    "estimated_completion_days": doc["estimated_completion_days"],
                    "created_at": doc.get("created_at_ts", doc.get("$createdAt")),
                    "progress_percent": progress_percent,
                    "completed_lessons_count": done_lessons,
                }
            )
        return summaries
    except AppwriteException as e:
        logger.error("Failed to list curricula: %s", e)
        raise


def get_curriculum_detail(user_id: str, curriculum_id: str) -> dict | None:
    """Return a full curriculum including parsed modules."""
    db, db_id, coll_id = _db_client()
    try:
        doc = db.get_document(database_id=db_id, collection_id=coll_id, document_id=curriculum_id)
    except AppwriteException as e:
        if e.code == 404:
            return None
        raise

    # Verify ownership
    if doc.get("user_id") != user_id:
        return None

    modules = json.loads(doc.get("modules_json", "[]"))
    completed_lessons: list[str] = json.loads(doc.get("progress_json", "[]") or "[]")
    return {
        "id": doc["$id"],
        "course_title": doc["course_title"],
        "topic": doc["topic"],
        "level": doc["level"],
        "total_modules": doc["total_modules"],
        "estimated_completion_days": doc["estimated_completion_days"],
        "created_at": doc.get("created_at_ts", doc.get("$createdAt")),
        "modules": modules,
        "completed_lessons": completed_lessons,
    }


def delete_curriculum(user_id: str, curriculum_id: str) -> bool:
    """Delete a curriculum. Returns True if deleted, False if not found/unauthorized."""
    db, db_id, coll_id = _db_client()
    try:
        doc = db.get_document(database_id=db_id, collection_id=coll_id, document_id=curriculum_id)
    except AppwriteException as e:
        if e.code == 404:
            return False
        raise

    if doc.get("user_id") != user_id:
        return False

    db.delete_document(database_id=db_id, collection_id=coll_id, document_id=curriculum_id)
    return True


def update_progress(user_id: str, curriculum_id: str, completed_lessons: list[str]) -> bool:
    """
    Persist the list of completed lesson IDs for a curriculum.
    Returns False if the curriculum was not found or doesn't belong to the user.
    """
    db, db_id, coll_id = _db_client()
    try:
        doc = db.get_document(database_id=db_id, collection_id=coll_id, document_id=curriculum_id)
    except AppwriteException as e:
        if e.code == 404:
            return False
        raise

    if doc.get("user_id") != user_id:
        return False

    db.update_document(
        database_id=db_id,
        collection_id=coll_id,
        document_id=curriculum_id,
        data={"progress_json": json.dumps(completed_lessons)},
    )
    return True
