#!/usr/bin/env python3
"""
Setup script for Community Appwrite collections.

Creates 5 collections with proper attributes and indexes.
Run once: `uv run python scripts/setup_community_collections.py`

Safe to re-run — skips collections that already exist.
"""

import sys
import os

# Add project root to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.exception import AppwriteException
from app.config import get_settings


def main():
    settings = get_settings()

    client = Client()
    client.set_endpoint(settings.appwrite_endpoint)
    client.set_project(settings.appwrite_project_id)
    client.set_key(settings.appwrite_api_key)

    db = Databases(client)
    db_id = settings.appwrite_database_id

    # ── Collection definitions ──────────────────────────────

    collections = [
        {
            "id": settings.appwrite_community_groups_collection_id,
            "name": "Community Groups",
            "attrs": [
                ("string", "name", 200, True),
                ("string", "slug", 100, True),
                ("string", "description", 500, True),
                ("string", "icon", 20, True),
                ("integer", "memberCount", False),
            ],
        },
        {
            "id": settings.appwrite_community_posts_collection_id,
            "name": "Community Posts",
            "attrs": [
                ("string", "groupSlug", 100, True),
                ("string", "authorId", 100, True),
                ("string", "authorName", 200, True),
                ("string", "title", 300, True),
                ("string", "body", 5000, True),
                ("string", "tags", 500, False),           # JSON array stored as string
                ("integer", "upvotes", False),
                ("integer", "commentCount", False),
                ("boolean", "isPinned", False),
                ("string", "progressSnapshot", 500, False), # JSON string
            ],
        },
        {
            "id": settings.appwrite_community_comments_collection_id,
            "name": "Community Comments",
            "attrs": [
                ("string", "postId", 100, True),
                ("string", "parentId", 100, False),
                ("string", "authorId", 100, True),
                ("string", "authorName", 200, True),
                ("string", "body", 3000, True),
            ],
        },
        {
            "id": settings.appwrite_community_votes_collection_id,
            "name": "Community Votes",
            "attrs": [
                ("string", "postId", 100, True),
                ("string", "userId", 100, True),
            ],
        },
        {
            "id": settings.appwrite_community_memberships_collection_id,
            "name": "Community Memberships",
            "attrs": [
                ("string", "groupSlug", 100, True),
                ("string", "userId", 100, True),
            ],
        },
    ]

    for coll in collections:
        coll_id = coll["id"]
        print(f"\n{'='*50}")
        print(f"Collection: {coll['name']} ({coll_id})")

        # Create collection
        try:
            db.create_collection(
                database_id=db_id,
                collection_id=coll_id,
                name=coll["name"],
                document_security=False,
            )
            print(f"  ✅ Created collection")
        except AppwriteException as e:
            if e.code == 409:
                print(f"  ⏭️  Collection already exists")
            else:
                print(f"  ❌ Error: {e.message}")
                continue

        # Enable permissions: any authenticated user can read/write for hackathon
        try:
            db.update_collection(
                database_id=db_id,
                collection_id=coll_id,
                name=coll["name"],
                permissions=[
                    'read("any")',
                    'create("any")',
                    'update("any")',
                    'delete("any")',
                ],
                document_security=False,
            )
            print(f"  ✅ Permissions set (open for hackathon)")
        except AppwriteException as e:
            print(f"  ⚠️  Permission update: {e.message}")

        # Create attributes
        for attr in coll["attrs"]:
            attr_type = attr[0]
            attr_key = attr[1]

            try:
                if attr_type == "string":
                    size = attr[2]
                    required = attr[3]
                    db.create_string_attribute(
                        database_id=db_id,
                        collection_id=coll_id,
                        key=attr_key,
                        size=size,
                        required=required,
                    )
                elif attr_type == "integer":
                    required = attr[2]
                    db.create_integer_attribute(
                        database_id=db_id,
                        collection_id=coll_id,
                        key=attr_key,
                        required=required,
                        default=0,
                    )
                elif attr_type == "boolean":
                    required = attr[2]
                    db.create_boolean_attribute(
                        database_id=db_id,
                        collection_id=coll_id,
                        key=attr_key,
                        required=required,
                        default=False,
                    )
                print(f"  ✅ Attribute: {attr_key} ({attr_type})")
            except AppwriteException as e:
                if e.code == 409:
                    print(f"  ⏭️  Attribute {attr_key} already exists")
                else:
                    print(f"  ❌ Attribute {attr_key}: {e.message}")

    print(f"\n{'='*50}")
    print("Setup complete! Now run: uv run python scripts/seed_community_data.py")


if __name__ == "__main__":
    main()
