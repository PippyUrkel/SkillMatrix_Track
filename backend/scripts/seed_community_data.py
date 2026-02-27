#!/usr/bin/env python3
"""
Seed script for Community collections.

Populates Appwrite with demo groups, posts, and comments.
Run after setup: `uv run python scripts/seed_community_data.py`

Safe to re-run — uses fixed IDs and skips existing documents.
"""

import json
import random
import sys
import os
import time

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.id import ID
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
    groups_coll = settings.appwrite_community_groups_collection_id
    posts_coll = settings.appwrite_community_posts_collection_id
    comments_coll = settings.appwrite_community_comments_collection_id

    # ── Seed Groups ─────────────────────────────────────────

    groups = [
        {"id": "grp-backend", "name": "Backend Developers", "slug": "backend", "description": "APIs, databases, microservices & server-side wizardry", "icon": "⚙️"},
        {"id": "grp-ml", "name": "ML Engineers", "slug": "ml-engineers", "description": "Machine learning, deep learning & data science", "icon": "🧠"},
        {"id": "grp-uiux", "name": "UI/UX Designers", "slug": "ui-ux", "description": "Design systems, user research & beautiful interfaces", "icon": "🎨"},
        {"id": "grp-devops", "name": "DevOps", "slug": "devops", "description": "CI/CD, containers, cloud infra & reliability", "icon": "🚀"},
        {"id": "grp-fullstack", "name": "Full Stack", "slug": "fullstack", "description": "End-to-end development from frontend to backend", "icon": "🌐"},
        {"id": "grp-datasci", "name": "Data Science", "slug": "data-science", "description": "Analytics, statistics, visualization & insights", "icon": "📊"},
    ]

    print("Seeding groups...")
    for g in groups:
        try:
            db.create_document(
                database_id=db_id,
                collection_id=groups_coll,
                document_id=g["id"],
                data={
                    "name": g["name"],
                    "slug": g["slug"],
                    "description": g["description"],
                    "icon": g["icon"],
                    "memberCount": 0,
                },
            )
            print(f"  ✅ {g['name']}")
        except AppwriteException as e:
            if e.code == 409:
                print(f"  ⏭️  {g['name']} already exists")
            else:
                print(f"  ❌ {g['name']}: {e.message}")

    # Wait for attributes to be available
    print("\nWaiting for Appwrite attribute indexing...")
    time.sleep(2)

    # ── Seed Posts ───────────────────────────────────────────

    demo_posts = [
        {
            "id": "post-001",
            "groupSlug": "backend",
            "authorId": "demo-user-1",
            "authorName": "Arjun K.",
            "title": "How do you structure FastAPI projects at scale?",
            "body": "I've been building a medium-sized FastAPI app and I'm struggling with organizing features, services, and routes. What folder structure do you recommend for 20+ endpoints?\n\nCurrently I'm using a flat structure but it's getting messy. Would love to hear what works for you.",
            "tags": ["fastapi", "architecture", "python"],
            "isPinned": True,
            "upvotes": 24,
        },
        {
            "id": "post-002",
            "groupSlug": "backend",
            "authorId": "demo-user-2",
            "authorName": "Priya S.",
            "title": "PostgreSQL vs MongoDB for a skill-tracking app?",
            "body": "Building a skill gap analyzer that stores user profiles, skills, and learning paths. Should I go relational or document-based? The data has some nested structures but also needs joins for analytics.",
            "tags": ["database", "postgresql", "mongodb"],
            "isPinned": False,
            "upvotes": 15,
        },
        {
            "id": "post-003",
            "groupSlug": "ml-engineers",
            "authorId": "demo-user-3",
            "authorName": "Rahul M.",
            "title": "Fine-tuning LLMs for skill extraction — what's working?",
            "body": "Has anyone tried fine-tuning smaller models (Mistral 7B, Phi-3) specifically for extracting skills from resumes and LinkedIn profiles? I'm getting decent results with few-shot prompting but wondering if fine-tuning is worth the effort.",
            "tags": ["llm", "fine-tuning", "nlp"],
            "isPinned": True,
            "upvotes": 31,
        },
        {
            "id": "post-004",
            "groupSlug": "ml-engineers",
            "authorId": "demo-user-4",
            "authorName": "Sneha R.",
            "title": "Federated learning for personalized course recommendations",
            "body": "We're exploring FL to build recommendation models without centralizing user data. Privacy is a big concern for our users. Anyone implemented something similar? What aggregation strategy works best?",
            "tags": ["federated-learning", "privacy", "recommendations"],
            "isPinned": False,
            "upvotes": 18,
        },
        {
            "id": "post-005",
            "groupSlug": "ui-ux",
            "authorId": "demo-user-5",
            "authorName": "Kavya D.",
            "title": "Neo-brutalism in production — how far is too far?",
            "body": "Love the thick borders and hard shadows aesthetic but some stakeholders think it's 'too aggressive'. Where do you draw the line between bold design and usability? Share your favorite neo-brutalist sites!",
            "tags": ["neo-brutalism", "design-systems", "debate"],
            "isPinned": False,
            "upvotes": 42,
        },
        {
            "id": "post-006",
            "groupSlug": "fullstack",
            "authorId": "demo-user-1",
            "authorName": "Arjun K.",
            "title": "React + FastAPI: Best practices for auth flow?",
            "body": "Using JWT tokens with Appwrite for auth. What's the cleanest way to handle token refresh, protected routes, and auth state sync between FastAPI backend and React frontend?",
            "tags": ["react", "fastapi", "auth", "jwt"],
            "isPinned": False,
            "upvotes": 22,
        },
        {
            "id": "post-007",
            "groupSlug": "devops",
            "authorId": "demo-user-6",
            "authorName": "Vikram P.",
            "title": "Docker Compose for dev vs Kubernetes for prod — smooth transition tips",
            "body": "Our team uses Docker Compose locally but deploys to K8s. The config gap is painful. Has anyone built a smooth bridge between the two? Helm charts? Kompose? Something else?",
            "tags": ["docker", "kubernetes", "devops"],
            "isPinned": False,
            "upvotes": 12,
        },
        {
            "id": "post-008",
            "groupSlug": "data-science",
            "authorId": "demo-user-4",
            "authorName": "Sneha R.",
            "title": "Skill demand forecasting with ARIMA vs Prophet",
            "body": "Trying to predict which tech skills will be in demand next quarter using job posting data. Comparing ARIMA and Facebook Prophet. Prophet seems easier but ARIMA gives me more control. Thoughts?",
            "tags": ["forecasting", "arima", "prophet", "skills"],
            "isPinned": False,
            "upvotes": 9,
        },
    ]

    print("\nSeeding posts...")
    for p in demo_posts:
        try:
            db.create_document(
                database_id=db_id,
                collection_id=posts_coll,
                document_id=p["id"],
                data={
                    "groupSlug": p["groupSlug"],
                    "authorId": p["authorId"],
                    "authorName": p["authorName"],
                    "title": p["title"],
                    "body": p["body"],
                    "tags": json.dumps(p["tags"]),
                    "upvotes": p["upvotes"],
                    "commentCount": 0,
                    "isPinned": p["isPinned"],
                    "progressSnapshot": "",
                },
            )
            print(f"  ✅ {p['title'][:50]}...")
        except AppwriteException as e:
            if e.code == 409:
                print(f"  ⏭️  {p['title'][:50]}... already exists")
            else:
                print(f"  ❌ {p['title'][:50]}: {e.message}")

    # ── Seed Comments ───────────────────────────────────────

    comment_texts = [
        "Great question! I've been wondering the same thing.",
        "We solved this by using a modular approach. Happy to share our setup.",
        "Following this thread — super relevant to what we're building.",
        "+1 on this. Would love to see more discussion.",
        "Interesting perspective. Have you considered the trade-offs?",
        "This is exactly what I needed. Thanks for sharing!",
        "We faced a similar challenge last quarter. DM me if you want details.",
        "Highly recommend reading the official docs on this topic.",
    ]

    commenters = [
        ("demo-user-1", "Arjun K."),
        ("demo-user-2", "Priya S."),
        ("demo-user-3", "Rahul M."),
        ("demo-user-4", "Sneha R."),
        ("demo-user-5", "Kavya D."),
        ("demo-user-6", "Vikram P."),
    ]

    print("\nSeeding comments...")
    comment_idx = 0
    for p in demo_posts:
        num_comments = random.randint(1, 3)
        for i in range(num_comments):
            commenter = commenters[comment_idx % len(commenters)]
            text = comment_texts[comment_idx % len(comment_texts)]
            cid = f"cmt-{p['id'][-3:]}-{i}"
            try:
                db.create_document(
                    database_id=db_id,
                    collection_id=comments_coll,
                    document_id=cid,
                    data={
                        "postId": p["id"],
                        "parentId": "",
                        "authorId": commenter[0],
                        "authorName": commenter[1],
                        "body": text,
                    },
                )
                print(f"  ✅ Comment on '{p['title'][:30]}...' by {commenter[1]}")
            except AppwriteException as e:
                if e.code == 409:
                    print(f"  ⏭️  Comment {cid} already exists")
                else:
                    print(f"  ❌ Comment {cid}: {e.message}")
            comment_idx += 1

        # Update comment count on the post
        try:
            db.update_document(
                database_id=db_id,
                collection_id=posts_coll,
                document_id=p["id"],
                data={"commentCount": num_comments},
            )
        except Exception:
            pass

    print(f"\n{'='*50}")
    print("✅ Seeding complete!")
    print(f"   {len(groups)} groups")
    print(f"   {len(demo_posts)} posts")
    print(f"   ~{comment_idx} comments")


if __name__ == "__main__":
    main()
