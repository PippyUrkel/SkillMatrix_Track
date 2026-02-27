"""Pydantic models for the Community feature."""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


# ── Groups ──────────────────────────────────────────────

class CommunityGroup(BaseModel):
    id: str
    name: str
    slug: str
    description: str
    icon: str  # emoji
    memberCount: int = 0
    joined: bool = False


# ── Posts ────────────────────────────────────────────────

class ProgressSnapshot(BaseModel):
    roadmap: str = ""
    percentComplete: int = 0
    currentNode: str = ""
    timeSpentHours: int = 0
    anonymous: bool = False


class CreatePostRequest(BaseModel):
    groupSlug: str
    title: str = Field(..., min_length=1, max_length=300)
    body: str = Field(..., min_length=1, max_length=10000)
    tags: list[str] = []
    progressSnapshot: Optional[ProgressSnapshot] = None


class CommunityPost(BaseModel):
    id: str
    groupSlug: str
    authorId: str
    authorName: str
    title: str
    body: str
    tags: list[str] = []
    upvotes: int = 0
    voted: bool = False  # has the requesting user voted
    commentCount: int = 0
    isPinned: bool = False
    progressSnapshot: Optional[ProgressSnapshot] = None
    createdAt: datetime


# ── Comments ────────────────────────────────────────────

class CreateCommentRequest(BaseModel):
    body: str = Field(..., min_length=1, max_length=5000)
    parentId: Optional[str] = None


class CommunityComment(BaseModel):
    id: str
    postId: str
    parentId: Optional[str] = None
    authorId: str
    authorName: str
    body: str
    createdAt: datetime
    replies: list[CommunityComment] = []


# ── Voting ──────────────────────────────────────────────

class VoteRequest(BaseModel):
    direction: str = "up"  # "up" to vote, "none" to unvote


# ── Leaderboard ────────────────────────────────────────

class LeaderboardEntry(BaseModel):
    userId: str
    userName: str
    postsCount: int = 0
    totalUpvotes: int = 0
    commentsCount: int = 0
    streak: int = 0
    badge: str = ""  # emoji badge
