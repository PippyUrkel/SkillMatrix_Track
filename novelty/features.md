# SkillMatrix — Novelty & Feature Report

## Problem Statement

> Build a platform that analyzes a student's academic performance, interests, and skills to suggest career paths. Include skill gap analysis comparing student profile vs. industry requirements, and recommend free/paid courses to bridge gaps.

---

## ✅ Novel Features Implemented

### 1. 🤖 AI-Powered Skill Gap Analysis Engine
- **Local LLM Integration (Ollama):** Uses a locally-hosted LLM to extract skills, estimate proficiency levels, and produce structured skill gap reports — no paid API dependency.
- **Multi-Source Skill Extraction:** Analyzes skills from **GitHub profiles** (repos, languages, commit patterns) and **resumes** via a unified `SkillAnalyzer` class.
- **Structured Gap Scoring:** Each skill is classified as `missing`, `partial`, or `strong` against a target job role, with a numeric gap score.
- **JSON Repair Pipeline:** LLM outputs are auto-repaired using `json_repair` to handle malformed responses gracefully — a production-hardening novelty.

### 2. 🎯 Real-Time Industry Skill Benchmarking
- **O*NET API Integration:** Pulls real occupation data (skills, knowledge, abilities) from the U.S. Bureau of Labor Statistics O*NET database.
- **ESCO API Integration:** Cross-references skills against the European Skills/Competences, Qualifications and Occupations taxonomy.
- **Dual-API Evaluator:** Combines both O*NET and ESCO to produce a comprehensive, globally-relevant skill evaluation — not just a static checklist.

### 3. 📚 AI-Curated Curriculum Generator
- **Dynamic Course Generation:** LLM generates complete multi-module learning curricula with **real YouTube video links**, descriptions, and estimated durations.
- **Customizable Parameters:** Users control `durationDays` and `dailyMinutes` to fit their schedule.
- **Appwrite Persistence:** Generated curricula are saved to Appwrite so users can resume across sessions.
- **Module-Level Progress Tracking:** Each lesson within each module tracks completion state individually.

### 4. 🧠 Federated Learning Engine
- **Privacy-Preserving ML:** A full federated learning pipeline (`fl_engine`) with client, orchestrator, strategy, and model layers.
- **FedAvg Aggregation:** Implements Federated Averaging so skill models improve across users without sharing raw data.
- **On-Device Inference:** Skill predictions can run locally via the inference module.

### 5. 🏠 Neo-Brutalist UI/UX Design
- **Custom Design System:** A cohesive neo-brutalist aesthetic with thick black borders, hard shadows, vibrant flat colors (yellow, pink, blue, purple, orange), and zero gradients.
- **Off-Centered Layouts:** The homepage uses intentionally asymmetric, tilted, and off-grid placement for visual impact.
- **Micro-Interactions:** Interactive hover states that shift elements (translate + shadow removal) to simulate physical button presses.
- **Custom Component Library:** `MatrixButton`, `MatrixCard`, `MatrixBadge`, `MatrixProgress`, `MatrixToggle` — all following the brutalist theme.

### 6. 📊 Interactive Dashboard
- **Real-Time Stats Grid:** Shows course progress, skills mastered, job match score, and learning streak — all computed from live data.
- **Skill Radar Chart:** Visual radar/spider chart for skill proficiency distribution.
- **Welcome Banner:** Personalized greeting with current level and target display.

### 7. 🎮 Gamification & Progress System
- **XP & Leveling:** Users earn XP for completing lessons (+20 XP) and courses (+150 XP) with a level-up system.
- **Achievement Badges:** Dynamic achievement unlocks (First Step, Getting Started, Course Champion, Skill Evaluator, etc.) with confetti animations.
- **Day Streak Tracking:** Tracks consecutive learning days.
- **Certificate Generation:** Modal with downloadable completion certificates per course.

### 8. 🔐 Authentication & User Profiles
- **Appwrite Auth:** Full signup/login flow with JWT-based authentication.
- **Onboarding Wizard:** Multi-step wizard capturing target role, experience level, GitHub ID, and LinkedIn ID.
- **Profile Persistence:** User profile (skills, target role, level, XP) persisted to Appwrite with auto-creation on first access.
- **Returning User Detection:** Users who completed onboarding skip it on subsequent logins.

### 9. 💼 Job Market Intelligence
- **Job Match Page:** Displays role matches based on the user's current skill profile.
- **Market Demand Visualization:** Bar charts showing real-time in-demand skills for target roles (sourced from LinkedIn, Indeed, Glassdoor data).

### 10. 🛠️ Developer Experience Features
- **Command Palette (⌘K):** Quick navigation across all pages.
- **Study Timer:** Built-in Pomodoro-style focus timer.
- **Onboarding Tooltips:** First-time user guidance overlays.
- **ElevenLabs Voice Assistant:** Real-time WebRTC voice conversational AI powered by ElevenLabs.
  - **YouTube Context Injection:** Dynamically fetches and provides the transcript of the currently playing YouTube video to the ElevenLabs Agent for context-aware Q&A.
- **Keyboard Shortcuts:** Global shortcuts for common actions.

### 11. 🧭 RIASEC Interest Profiling
- **Holland Codes Questionnaire:** 12-question RIASEC assessment (2 per type: Realistic, Investigative, Artistic, Social, Enterprising, Conventional) integrated as onboarding step 2.
- **Interest-Matched Career Paths:** Career path cards are sorted by interest alignment score with a visual "X% match" badge.
- **Score Normalization:** Raw answers (1-5 scale) are normalized to 0-100 percentage scores and persisted to the backend.

### 12. 💎 Paid Course Recommendations
- **LLM-Powered Recommendations:** Ollama generates 6 course recommendations (2 per platform) from Coursera, Udemy, and edX with titles, descriptions, estimated prices, and difficulty levels.
- **Direct Platform Links:** Each recommendation links directly to the platform's search page for easy enrollment.
- **Free/Paid Tab Toggle:** Learning page features a brutalist tab switcher between free YouTube courses and paid platform recommendations.
- **Graceful Fallback:** If the LLM is unavailable, search-link-only recommendations are generated automatically.

### 13. 🗺️ Career Path Suggestion Engine
- **Interest-Driven Path Ranking:** Career paths are automatically sorted by RIASEC interest match score, with a visual "X% match" badge per card.
- **Multi-Path Selection:** 7+ career paths (Frontend, Backend, Full Stack, Data Science, Cybersecurity, Mobile Dev, DevOps) each mapped to primary RIASEC codes.
- **Skill + Interest Alignment:** Combines target skills with RIASEC interest scores to recommend the most suitable career direction — not just generic job listings.

---

## 🔲 Remaining Features (Per Problem Statement)

### High Priority — Core to Problem Statement

| # | Feature | Status | Description |
|---|---------|--------|---------|
| 1 | **Academic Performance Analysis** | ❌ Not Started | Ingest student transcripts, GPA, grades per subject to map academic strengths to career paths. |
| 2 | **Student Profile vs. Industry Comparison Dashboard** | 🟡 Partial | Skill gap page exists but needs a side-by-side visual comparing student's full profile against industry benchmarks. |

### Medium Priority — Enhancing Existing Features

| # | Feature | Status | Description |
|---|---------|--------|-------------|
| 6 | **Resume Upload & Parsing** | ❌ Not Started | Allow students to upload PDF/DOCX resumes and auto-extract skills (backend `analyze_resume` exists but no frontend upload flow). |
| 7 | **GitHub Auto-Scraping** | ❌ Not Started | Backend `analyze_github` exists but needs a frontend trigger to scrape and analyze a user's GitHub profile automatically from their saved GitHub ID. |
| 8 | **LinkedIn Skill Import** | ❌ Not Started | Pull skills directly from LinkedIn profile using the LinkedIn ID captured during onboarding. ⚠️ LinkedIn ID is optional — must ensure no TOS violations before scraping. |
| 9 | **Quiz / Assessment Module** | 🟡 Partial | Backend `quiz` feature directory exists but needs full implementation — quiz generation, scoring, and skill-level calibration. |
| 10 | **Course Completion → Skill Update Loop** | ❌ Not Started | When a user completes a course, automatically re-evaluate and update their skill levels in the gap analysis. |

### Nice to Have — Polish & Differentiation

| # | Feature | Status | Description |
|---|---------|--------|-------------|
| 11 | **Peer Comparison** | ❌ Not Started | Anonymous benchmarking against other students targeting the same role (leveraging federated learning). |
| 12 | **Mentor Matching** | ❌ Not Started | Connect students with mentors based on skill overlap and career goals. |
| 13 | **Export / PDF Report** | ❌ Not Started | Generate a downloadable PDF of the full skill gap analysis and recommended learning path. |
| 14 | **Mobile Responsive Polish** | 🟡 Partial | Most pages work on mobile but need testing and fine-tuning. |
| 15 | **Dark Mode** | ❌ Not Started | The brutalist theme is light-only; adding a dark mode variant would be a nice touch. |

---

## Architecture Summary

```
┌───────────────┐     ┌──────────────────────┐     ┌──────────────┐
│   Frontend    │────▶│   FastAPI Backend     │────▶│   Appwrite   │
│  React + Vite │     │                      │     │   (Auth+DB)  │
│  TailwindCSS  │     │  ┌─ Skill Analyzer   │     └──────────────┘
│               │     │  ├─ Skill Evaluator   │
│               │     │  ├─ Curriculum Gen    │────▶ Ollama (Local LLM)
│               │     │  ├─ Paid Courses      │
│               │     │  ├─ FL Engine         │
│               │     │  └─ Profile/Auth      │────▶ O*NET + ESCO APIs
└───────────────┘     └──────────────────────┘
```
