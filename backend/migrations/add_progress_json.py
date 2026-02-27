"""
Migration: Add progress_json string attribute to the curricula collection.
Run once with: uv run python migrations/add_progress_json.py
"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.exception import AppwriteException
from app.config import get_settings

settings = get_settings()

client = Client()
client.set_endpoint(settings.appwrite_endpoint)
client.set_project(settings.appwrite_project_id)
client.set_key(settings.appwrite_api_key)

db = Databases(client)
DB_ID   = settings.appwrite_database_id
COLL_ID = settings.appwrite_curricula_collection_id

try:
    db.create_string_attribute(
        database_id=DB_ID,
        collection_id=COLL_ID,
        key="progress_json",
        size=500000,   # up to ~500k chars — enough for thousands of lesson IDs
        required=False,
        default="[]",
    )
    print("✅  progress_json attribute created successfully.")
except AppwriteException as e:
    if "already exists" in str(e).lower() or e.code == 409:
        print("ℹ️  progress_json already exists — nothing to do.")
    else:
        print(f"❌  Failed: {e}")
        raise
