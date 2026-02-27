import re
import logging

logger = logging.getLogger(__name__)

# Common tech skills for keyword matching (pre-filter before Gemini)
KNOWN_SKILLS = {
    # Languages
    "python", "javascript", "typescript", "java", "c++", "c#", "go", "rust",
    "ruby", "php", "swift", "kotlin", "scala", "r", "matlab", "perl",
    "html", "css", "sql", "bash", "shell", "powershell", "dart", "lua",
    # Frameworks / Libraries
    "react", "angular", "vue", "next.js", "nuxt", "svelte", "django", "flask",
    "fastapi", "express", "spring", "rails", "laravel", ".net", "asp.net",
    "node.js", "tensorflow", "pytorch", "keras", "scikit-learn", "pandas",
    "numpy", "matplotlib", "opencv", "flutter", "react native",
    # Cloud / DevOps
    "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "ansible",
    "jenkins", "github actions", "ci/cd", "nginx", "linux", "git",
    # Databases
    "postgresql", "mysql", "mongodb", "redis", "elasticsearch", "sqlite",
    "dynamodb", "firebase", "appwrite", "cassandra", "neo4j",
    # Concepts
    "machine learning", "deep learning", "nlp", "computer vision", "data science",
    "data engineering", "devops", "microservices", "rest api", "graphql",
    "agile", "scrum", "tdd", "oop", "functional programming",
    "system design", "distributed systems", "cloud computing",
}


class ResumeParser:
    """Extracts skills from plain-text resume content."""

    def extract_skills(self, resume_text: str) -> dict:
        """
        Pre-process resume text and extract:
        - keyword_skills: skills matched from the known skills dictionary
        - sections: recognized resume sections and their content
        - raw_text: cleaned full text for Gemini analysis

        Returns a dict with those keys.
        """
        cleaned = self._clean_text(resume_text)
        keyword_skills = self._match_keywords(cleaned)
        sections = self._extract_sections(cleaned)

        return {
            "keyword_skills": sorted(keyword_skills),
            "sections": sections,
            "raw_text": cleaned,
        }

    # ── internal helpers ────────────────────────

    def _clean_text(self, text: str) -> str:
        """Normalize whitespace and remove non-printable chars."""
        text = re.sub(r"[^\S\n]+", " ", text)  # collapse whitespace
        text = re.sub(r"\n{3,}", "\n\n", text)  # collapse blank lines
        return text.strip()

    def _match_keywords(self, text: str) -> set[str]:
        """Find known skills mentioned in the text (case-insensitive)."""
        text_lower = text.lower()
        found: set[str] = set()
        for skill in KNOWN_SKILLS:
            # Word boundary match to avoid partial matches
            pattern = r"\b" + re.escape(skill) + r"\b"
            if re.search(pattern, text_lower):
                found.add(skill)
        return found

    def _extract_sections(self, text: str) -> dict[str, str]:
        """
        Identify common resume sections by header patterns.
        Returns a dict mapping section_name → section_content.
        """
        section_headers = [
            "skills", "technical skills", "technologies", "tools",
            "experience", "work experience", "professional experience",
            "projects", "education", "certifications", "summary",
            "objective", "achievements", "publications",
        ]

        # Build pattern: a line that starts with a known section header
        pattern_parts = [re.escape(h) for h in section_headers]
        header_pattern = re.compile(
            r"^[ \t]*(" + "|".join(pattern_parts) + r")[ \t]*[:\-]?[ \t]*$",
            re.IGNORECASE | re.MULTILINE,
        )

        matches = list(header_pattern.finditer(text))
        sections: dict[str, str] = {}

        for i, match in enumerate(matches):
            name = match.group(1).strip().lower()
            start = match.end()
            end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
            content = text[start:end].strip()
            if content:
                sections[name] = content

        return sections
