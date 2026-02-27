"""Community REST endpoints."""

from __future__ import annotations

import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from appwrite.client import Client

from app.databases.appwrite_client import get_appwrite_client
from app.middleware.auth_middleware import get_current_user
from .service import CommunityService
from .schemas import (
    CommunityComment,
    CommunityGroup,
    CommunityPost,
    CreateCommentRequest,
    CreatePostRequest,
    LeaderboardEntry,
    VoteRequest,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/community", tags=["Community"])


def get_community_service(
    client: Client = Depends(get_appwrite_client),
) -> CommunityService:
    return CommunityService(client)


# ── Groups ──────────────────────────────────────────────

@router.get("/groups", response_model=list[CommunityGroup])
async def list_groups(
    user: dict = Depends(get_current_user),
    svc: CommunityService = Depends(get_community_service),
):
    return svc.get_groups(user["id"])


@router.post("/groups/{slug}/join")
async def join_group(
    slug: str,
    user: dict = Depends(get_current_user),
    svc: CommunityService = Depends(get_community_service),
):
    ok = svc.join_group(slug, user["id"])
    if not ok:
        raise HTTPException(404, "Group not found")
    return {"status": "joined", "slug": slug}


@router.post("/groups/{slug}/leave")
async def leave_group(
    slug: str,
    user: dict = Depends(get_current_user),
    svc: CommunityService = Depends(get_community_service),
):
    ok = svc.leave_group(slug, user["id"])
    if not ok:
        raise HTTPException(404, "Group not found")
    return {"status": "left", "slug": slug}


# ── Posts ────────────────────────────────────────────────

@router.get("/posts", response_model=list[CommunityPost])
async def list_posts(
    group: Optional[str] = Query(None),
    sort: str = Query("hot"),
    page: int = Query(1, ge=1),
    user: dict = Depends(get_current_user),
    svc: CommunityService = Depends(get_community_service),
):
    return svc.get_posts(
        user_id=user["id"],
        group=group,
        sort=sort,
        page=page,
    )


@router.post("/posts", response_model=CommunityPost)
async def create_post(
    body: CreatePostRequest,
    user: dict = Depends(get_current_user),
    svc: CommunityService = Depends(get_community_service),
):
    name = user.get("name") or user.get("email", "Anonymous")
    return svc.create_post(body, user["id"], name)


@router.get("/posts/{post_id}", response_model=CommunityPost)
async def get_post(
    post_id: str,
    user: dict = Depends(get_current_user),
    svc: CommunityService = Depends(get_community_service),
):
    post = svc.get_post(post_id, user["id"])
    if not post:
        raise HTTPException(404, "Post not found")
    return post


@router.get("/posts/{post_id}/comments", response_model=list[CommunityComment])
async def get_comments(
    post_id: str,
    user: dict = Depends(get_current_user),
    svc: CommunityService = Depends(get_community_service),
):
    return svc.get_post_comments(post_id)


@router.post("/posts/{post_id}/vote")
async def vote(
    post_id: str,
    body: VoteRequest,
    user: dict = Depends(get_current_user),
    svc: CommunityService = Depends(get_community_service),
):
    new_count = svc.vote_post(post_id, user["id"], body.direction)
    return {"upvotes": new_count}


@router.delete("/posts/{post_id}")
async def delete_post(
    post_id: str,
    user: dict = Depends(get_current_user),
    svc: CommunityService = Depends(get_community_service),
):
    ok = svc.delete_post(post_id, user["id"])
    if not ok:
        raise HTTPException(403, "Not authorized or post not found")
    return {"status": "deleted"}


@router.post("/posts/{post_id}/comments", response_model=CommunityComment)
async def add_comment(
    post_id: str,
    body: CreateCommentRequest,
    user: dict = Depends(get_current_user),
    svc: CommunityService = Depends(get_community_service),
):
    name = user.get("name") or user.get("email", "Anonymous")
    comment = svc.add_comment(post_id, body, user["id"], name)
    if not comment:
        raise HTTPException(404, "Post not found")
    return comment


# ── Leaderboard ─────────────────────────────────────────

@router.get("/leaderboard", response_model=list[LeaderboardEntry])
async def leaderboard(
    user: dict = Depends(get_current_user),
    svc: CommunityService = Depends(get_community_service),
):
    return svc.get_leaderboard()
