"""
Appwrite-backed community service.

All data is persisted in Appwrite collections. The setup and seed scripts
must be run first to create the collections and populate demo data.
"""

from __future__ import annotations

import json
import logging
import math
import time
from datetime import datetime, timezone
from typing import Optional

from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.query import Query
from appwrite.id import ID
from appwrite.exception import AppwriteException

from app.config import get_settings
from .schemas import (
    CommunityComment,
    CommunityGroup,
    CommunityPost,
    CreateCommentRequest,
    CreatePostRequest,
    LeaderboardEntry,
    ProgressSnapshot,
)

logger = logging.getLogger(__name__)


class CommunityService:
    """Appwrite-backed community CRUD."""

    def __init__(self, appwrite_client: Client):
        self.db = Databases(appwrite_client)
        s = get_settings()
        self.db_id = s.appwrite_database_id
        self.groups_coll = s.appwrite_community_groups_collection_id
        self.posts_coll = s.appwrite_community_posts_collection_id
        self.comments_coll = s.appwrite_community_comments_collection_id
        self.votes_coll = s.appwrite_community_votes_collection_id
        self.memberships_coll = s.appwrite_community_memberships_collection_id

    # ── Groups ──────────────────────────────────────────────

    def get_groups(self, user_id: str | None = None) -> list[CommunityGroup]:
        try:
            resp = self.db.list_documents(
                database_id=self.db_id,
                collection_id=self.groups_coll,
                queries=[Query.limit(50)],
            )
            groups = []
            for doc in resp.get("documents", []):
                joined = False
                if user_id:
                    try:
                        mem = self.db.list_documents(
                            database_id=self.db_id,
                            collection_id=self.memberships_coll,
                            queries=[
                                Query.equal("groupSlug", doc["slug"]),
                                Query.equal("userId", user_id),
                                Query.limit(1),
                            ],
                        )
                        joined = len(mem.get("documents", [])) > 0
                    except Exception:
                        pass
                groups.append(CommunityGroup(
                    id=doc["$id"],
                    name=doc["name"],
                    slug=doc["slug"],
                    description=doc["description"],
                    icon=doc["icon"],
                    memberCount=doc.get("memberCount", 0),
                    joined=joined,
                ))
            return groups
        except Exception as e:
            logger.error("get_groups: %s", e)
            return []

    def join_group(self, slug: str, user_id: str) -> bool:
        try:
            # Check not already a member
            existing = self.db.list_documents(
                database_id=self.db_id,
                collection_id=self.memberships_coll,
                queries=[
                    Query.equal("groupSlug", slug),
                    Query.equal("userId", user_id),
                    Query.limit(1),
                ],
            )
            if existing.get("documents"):
                return True  # already joined

            self.db.create_document(
                database_id=self.db_id,
                collection_id=self.memberships_coll,
                document_id=ID.unique(),
                data={"groupSlug": slug, "userId": user_id},
            )
            # Increment memberCount
            self._increment_member_count(slug, 1)
            return True
        except Exception as e:
            logger.error("join_group: %s", e)
            return False

    def leave_group(self, slug: str, user_id: str) -> bool:
        try:
            existing = self.db.list_documents(
                database_id=self.db_id,
                collection_id=self.memberships_coll,
                queries=[
                    Query.equal("groupSlug", slug),
                    Query.equal("userId", user_id),
                    Query.limit(1),
                ],
            )
            for doc in existing.get("documents", []):
                self.db.delete_document(
                    database_id=self.db_id,
                    collection_id=self.memberships_coll,
                    document_id=doc["$id"],
                )
            self._increment_member_count(slug, -1)
            return True
        except Exception as e:
            logger.error("leave_group: %s", e)
            return False

    def _increment_member_count(self, slug: str, delta: int):
        """Update the memberCount on the group doc."""
        try:
            groups = self.db.list_documents(
                database_id=self.db_id,
                collection_id=self.groups_coll,
                queries=[Query.equal("slug", slug), Query.limit(1)],
            )
            for doc in groups.get("documents", []):
                new_count = max(0, doc.get("memberCount", 0) + delta)
                self.db.update_document(
                    database_id=self.db_id,
                    collection_id=self.groups_coll,
                    document_id=doc["$id"],
                    data={"memberCount": new_count},
                )
        except Exception as e:
            logger.error("_increment_member_count: %s", e)

    # ── Posts ────────────────────────────────────────────────

    def create_post(self, req: CreatePostRequest, user_id: str, user_name: str) -> CommunityPost:
        snapshot_json = ""
        if req.progressSnapshot:
            snapshot_json = json.dumps(req.progressSnapshot.model_dump())

        doc = self.db.create_document(
            database_id=self.db_id,
            collection_id=self.posts_coll,
            document_id=ID.unique(),
            data={
                "groupSlug": req.groupSlug,
                "authorId": user_id,
                "authorName": user_name,
                "title": req.title,
                "body": req.body,
                "tags": json.dumps(req.tags),
                "upvotes": 0,
                "commentCount": 0,
                "isPinned": False,
                "progressSnapshot": snapshot_json,
            },
        )
        return self._doc_to_post(doc, user_id)

    def get_posts(
        self,
        user_id: str | None = None,
        group: str | None = None,
        sort: str = "hot",
        page: int = 1,
        per_page: int = 20,
    ) -> list[CommunityPost]:
        try:
            queries: list = [Query.limit(100)]  # Fetch more, sort in-memory for hot
            if group:
                queries.append(Query.equal("groupSlug", group))
            if sort == "new":
                queries.append(Query.order_desc("$createdAt"))
            elif sort == "top":
                queries.append(Query.order_desc("upvotes"))

            resp = self.db.list_documents(
                database_id=self.db_id,
                collection_id=self.posts_coll,
                queries=queries,
            )
            posts = resp.get("documents", [])

            # Hot sort in-memory (needs recency calculation)
            if sort == "hot":
                posts.sort(key=lambda p: self._hot_score(p), reverse=True)

            # Pinned first
            pinned = [p for p in posts if p.get("isPinned")]
            unpinned = [p for p in posts if not p.get("isPinned")]
            posts = pinned + unpinned

            # Paginate
            start = (page - 1) * per_page
            posts = posts[start: start + per_page]

            return [self._doc_to_post(p, user_id) for p in posts]
        except Exception as e:
            logger.error("get_posts: %s", e)
            return []

    def get_post(self, post_id: str, user_id: str | None = None) -> CommunityPost | None:
        try:
            doc = self.db.get_document(
                database_id=self.db_id,
                collection_id=self.posts_coll,
                document_id=post_id,
            )
            return self._doc_to_post(doc, user_id)
        except AppwriteException as e:
            if e.code == 404:
                return None
            logger.error("get_post: %s", e)
            return None

    def delete_post(self, post_id: str, user_id: str) -> bool:
        try:
            doc = self.db.get_document(
                database_id=self.db_id,
                collection_id=self.posts_coll,
                document_id=post_id,
            )
            if doc.get("authorId") != user_id:
                return False
            self.db.delete_document(
                database_id=self.db_id,
                collection_id=self.posts_coll,
                document_id=post_id,
            )
            # Clean up associated comments and votes
            self._delete_related(self.comments_coll, "postId", post_id)
            self._delete_related(self.votes_coll, "postId", post_id)
            return True
        except Exception as e:
            logger.error("delete_post: %s", e)
            return False

    # ── Comments ────────────────────────────────────────────

    def get_post_comments(self, post_id: str) -> list[CommunityComment]:
        try:
            resp = self.db.list_documents(
                database_id=self.db_id,
                collection_id=self.comments_coll,
                queries=[
                    Query.equal("postId", post_id),
                    Query.limit(100),
                    Query.order_asc("$createdAt"),
                ],
            )
            all_comments = resp.get("documents", [])
            top_level = [c for c in all_comments if not c.get("parentId")]
            result = []
            for c in top_level:
                replies = sorted(
                    [r for r in all_comments if r.get("parentId") == c["$id"]],
                    key=lambda r: r.get("$createdAt", ""),
                )
                result.append(CommunityComment(
                    id=c["$id"],
                    postId=c["postId"],
                    parentId=None,
                    authorId=c["authorId"],
                    authorName=c["authorName"],
                    body=c["body"],
                    createdAt=c.get("$createdAt", ""),
                    replies=[
                        CommunityComment(
                            id=r["$id"],
                            postId=r["postId"],
                            parentId=r.get("parentId"),
                            authorId=r["authorId"],
                            authorName=r["authorName"],
                            body=r["body"],
                            createdAt=r.get("$createdAt", ""),
                            replies=[],
                        )
                        for r in replies
                    ],
                ))
            return result
        except Exception as e:
            logger.error("get_post_comments: %s", e)
            return []

    def add_comment(
        self, post_id: str, req: CreateCommentRequest, user_id: str, user_name: str
    ) -> CommunityComment | None:
        try:
            # Verify post exists
            self.db.get_document(
                database_id=self.db_id,
                collection_id=self.posts_coll,
                document_id=post_id,
            )
        except AppwriteException:
            return None

        doc = self.db.create_document(
            database_id=self.db_id,
            collection_id=self.comments_coll,
            document_id=ID.unique(),
            data={
                "postId": post_id,
                "parentId": req.parentId or "",
                "authorId": user_id,
                "authorName": user_name,
                "body": req.body,
            },
        )
        # Increment commentCount on the post
        try:
            post = self.db.get_document(
                database_id=self.db_id,
                collection_id=self.posts_coll,
                document_id=post_id,
            )
            self.db.update_document(
                database_id=self.db_id,
                collection_id=self.posts_coll,
                document_id=post_id,
                data={"commentCount": post.get("commentCount", 0) + 1},
            )
        except Exception:
            pass

        return CommunityComment(
            id=doc["$id"],
            postId=post_id,
            parentId=req.parentId if req.parentId else None,
            authorId=user_id,
            authorName=user_name,
            body=req.body,
            createdAt=doc.get("$createdAt", ""),
            replies=[],
        )

    # ── Voting ──────────────────────────────────────────────

    def vote_post(self, post_id: str, user_id: str, direction: str = "up") -> int:
        try:
            # Check if already voted
            existing = self.db.list_documents(
                database_id=self.db_id,
                collection_id=self.votes_coll,
                queries=[
                    Query.equal("postId", post_id),
                    Query.equal("userId", user_id),
                    Query.limit(1),
                ],
            )
            post = self.db.get_document(
                database_id=self.db_id,
                collection_id=self.posts_coll,
                document_id=post_id,
            )
            current = post.get("upvotes", 0)

            if existing.get("documents"):
                # Already voted — toggle off
                for vdoc in existing["documents"]:
                    self.db.delete_document(
                        database_id=self.db_id,
                        collection_id=self.votes_coll,
                        document_id=vdoc["$id"],
                    )
                new_count = max(0, current - 1)
            else:
                # New vote
                self.db.create_document(
                    database_id=self.db_id,
                    collection_id=self.votes_coll,
                    document_id=ID.unique(),
                    data={"postId": post_id, "userId": user_id},
                )
                new_count = current + 1

            self.db.update_document(
                database_id=self.db_id,
                collection_id=self.posts_coll,
                document_id=post_id,
                data={"upvotes": new_count},
            )
            return new_count
        except Exception as e:
            logger.error("vote_post: %s", e)
            return 0

    # ── Leaderboard ─────────────────────────────────────────

    def get_leaderboard(self, limit: int = 10) -> list[LeaderboardEntry]:
        try:
            # Fetch all posts
            posts_resp = self.db.list_documents(
                database_id=self.db_id,
                collection_id=self.posts_coll,
                queries=[Query.limit(200)],
            )
            # Fetch all comments
            comments_resp = self.db.list_documents(
                database_id=self.db_id,
                collection_id=self.comments_coll,
                queries=[Query.limit(500)],
            )

            user_stats: dict[str, dict] = {}
            for p in posts_resp.get("documents", []):
                uid = p["authorId"]
                if uid not in user_stats:
                    user_stats[uid] = {
                        "userId": uid,
                        "userName": p["authorName"],
                        "posts": 0,
                        "upvotes": 0,
                        "comments": 0,
                    }
                user_stats[uid]["posts"] += 1
                user_stats[uid]["upvotes"] += p.get("upvotes", 0)

            for c in comments_resp.get("documents", []):
                uid = c["authorId"]
                if uid not in user_stats:
                    user_stats[uid] = {
                        "userId": uid,
                        "userName": c["authorName"],
                        "posts": 0,
                        "upvotes": 0,
                        "comments": 0,
                    }
                user_stats[uid]["comments"] += 1

            entries = []
            for s in user_stats.values():
                streak = min(s["posts"] + s["comments"], 14)
                badge = ""
                if streak >= 10:
                    badge = "🔥"
                elif streak >= 5:
                    badge = "⚡"
                elif streak >= 3:
                    badge = "✨"
                entries.append(LeaderboardEntry(
                    userId=s["userId"],
                    userName=s["userName"],
                    postsCount=s["posts"],
                    totalUpvotes=s["upvotes"],
                    commentsCount=s["comments"],
                    streak=streak,
                    badge=badge,
                ))

            entries.sort(
                key=lambda e: e.postsCount * 10 + e.totalUpvotes + e.commentsCount * 2,
                reverse=True,
            )
            return entries[:limit]
        except Exception as e:
            logger.error("get_leaderboard: %s", e)
            return []

    # ── Helpers ─────────────────────────────────────────────

    def _hot_score(self, post_doc: dict) -> float:
        upvotes = post_doc.get("upvotes", 0)
        try:
            ts = datetime.fromisoformat(
                post_doc.get("$createdAt", "").replace("Z", "+00:00")
            ).timestamp()
        except Exception:
            ts = time.time()
        age_hours = max(1, (time.time() - ts) / 3600)
        return upvotes / math.pow(age_hours + 2, 1.5)

    def _doc_to_post(self, doc: dict, user_id: str | None) -> CommunityPost:
        # Parse tags
        tags_raw = doc.get("tags", "[]")
        try:
            tags = json.loads(tags_raw) if tags_raw else []
        except (json.JSONDecodeError, TypeError):
            tags = []

        # Parse progress snapshot
        snapshot = None
        snap_raw = doc.get("progressSnapshot", "")
        if snap_raw:
            try:
                snapshot = ProgressSnapshot(**json.loads(snap_raw))
            except Exception:
                pass

        # Check if user voted
        voted = False
        if user_id:
            try:
                v = self.db.list_documents(
                    database_id=self.db_id,
                    collection_id=self.votes_coll,
                    queries=[
                        Query.equal("postId", doc["$id"]),
                        Query.equal("userId", user_id),
                        Query.limit(1),
                    ],
                )
                voted = len(v.get("documents", [])) > 0
            except Exception:
                pass

        return CommunityPost(
            id=doc["$id"],
            groupSlug=doc.get("groupSlug", ""),
            authorId=doc.get("authorId", ""),
            authorName=doc.get("authorName", ""),
            title=doc.get("title", ""),
            body=doc.get("body", ""),
            tags=tags,
            upvotes=doc.get("upvotes", 0),
            voted=voted,
            commentCount=doc.get("commentCount", 0),
            isPinned=doc.get("isPinned", False),
            progressSnapshot=snapshot,
            createdAt=doc.get("$createdAt", ""),
        )

    def _delete_related(self, collection_id: str, field: str, value: str):
        """Delete all docs in a collection matching field=value."""
        try:
            resp = self.db.list_documents(
                database_id=self.db_id,
                collection_id=collection_id,
                queries=[Query.equal(field, value), Query.limit(100)],
            )
            for doc in resp.get("documents", []):
                self.db.delete_document(
                    database_id=self.db_id,
                    collection_id=collection_id,
                    document_id=doc["$id"],
                )
        except Exception as e:
            logger.error("_delete_related: %s", e)
