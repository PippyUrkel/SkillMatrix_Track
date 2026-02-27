import logging

import httpx

from app.config import get_settings

logger = logging.getLogger(__name__)

GITHUB_API = "https://api.github.com"


class GitHubScraper:
    """Fetches and structures data from a GitHub user profile."""

    def __init__(self):
        settings = get_settings()
        self.headers: dict[str, str] = {"Accept": "application/vnd.github.v3+json"}
        if settings.github_token:
            self.headers["Authorization"] = f"Bearer {settings.github_token}"

    async def scrape_profile(self, username: str) -> dict:
        """
        Fetch a complete profile summary for the given GitHub username.

        Returns a dict with keys:
            profile, repos, languages, total_stars, recent_activity
        """
        async with httpx.AsyncClient(
            base_url=GITHUB_API, headers=self.headers, timeout=15
        ) as client:
            profile = await self._fetch_profile(client, username)
            repos = await self._fetch_repos(client, username)
            languages = self._aggregate_languages(repos)
            total_stars = sum(r.get("stars", 0) for r in repos)
            recent_repos = [r for r in repos if r.get("recent")]

        return {
            "username": username,
            "profile": profile,
            "repos": repos,
            "languages": languages,
            "total_stars": total_stars,
            "total_repos": len(repos),
            "recent_repos": len(recent_repos),
        }

    # ── internal helpers ────────────────────────

    async def _fetch_profile(self, client: httpx.AsyncClient, username: str) -> dict:
        """Fetch user bio, company, location, etc."""
        try:
            resp = await client.get(f"/users/{username}")
            resp.raise_for_status()
            data = resp.json()
            return {
                "name": data.get("name", ""),
                "bio": data.get("bio", ""),
                "company": data.get("company", ""),
                "location": data.get("location", ""),
                "public_repos": data.get("public_repos", 0),
                "followers": data.get("followers", 0),
                "created_at": data.get("created_at", ""),
            }
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                raise ValueError(f"GitHub user '{username}' not found")
            raise

    async def _fetch_repos(
        self, client: httpx.AsyncClient, username: str, limit: int = 30
    ) -> list[dict]:
        """Fetch top repos sorted by recent push date."""
        try:
            resp = await client.get(
                f"/users/{username}/repos",
                params={
                    "sort": "pushed",
                    "direction": "desc",
                    "per_page": limit,
                    "type": "owner",
                },
            )
            resp.raise_for_status()
            raw_repos = resp.json()
        except httpx.HTTPStatusError:
            logger.warning("Failed to fetch repos for %s", username)
            return []

        repos = []
        for repo in raw_repos:
            if repo.get("fork"):
                continue  # skip forks
            pushed = repo.get("pushed_at", "")
            repos.append(
                {
                    "name": repo.get("name", ""),
                    "description": repo.get("description", ""),
                    "language": repo.get("language", ""),
                    "stars": repo.get("stargazers_count", 0),
                    "forks": repo.get("forks_count", 0),
                    "size_kb": repo.get("size", 0),
                    "topics": repo.get("topics", []),
                    "pushed_at": pushed,
                    "recent": pushed[:4] >= "2025" if pushed else False,
                }
            )
        return repos

    def _aggregate_languages(self, repos: list[dict]) -> dict[str, int]:
        """Count repos per language."""
        lang_counts: dict[str, int] = {}
        for repo in repos:
            lang = repo.get("language")
            if lang:
                lang_counts[lang] = lang_counts.get(lang, 0) + 1
        # Sort by count descending
        return dict(sorted(lang_counts.items(), key=lambda x: x[1], reverse=True))
