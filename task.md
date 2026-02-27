# SkillMatrix - Future Endpoints Task List

This document outlines the pending endpoints and features that need to be implemented to complete the SkillMatrix backend, focusing on data persistence, user management, and learning tracking.

## 1. User Profile & State Management (`/api/users/*`)
- [ ] `GET /api/users/profile` - Fetch the logged-in user's profile, including current saved skills and target job role.
- [ ] `PUT /api/users/profile` - Update basic profile information or target job role.
- [ ] `POST /api/users/skills` - Manually add a new skill to the user's profile (bypassing AI extraction).
- [ ] `DELETE /api/users/skills/{skill_name}` - Remove a specific skill from the user's profile.

## 2. Curriculum & Learning Progress (`/api/learning/*`)
- [ ] `POST /api/learning/curriculums` - Save an AI-generated curriculum to the user's account.
- [ ] `GET /api/learning/curriculums` - Retrieve all saved curriculums for the user.
- [ ] `PUT /api/learning/modules/{module_id}/progress` - Update completion status (in-progress/completed) for a module/video.
- [ ] `POST /api/learning/re-evaluate` - Trigger a re-evaluation of skills after completing a learning module.

## 3. Job Market & Company Integration (`/api/jobs/*`)
- [ ] `GET /api/jobs/trending` - Fetch trending target roles/job titles based on market data.
- [ ] `GET /api/jobs/companies/{company_id}/requirements` - Fetch specific skill requirements for a role at a target company.

## 4. History & Analytics (`/api/history/*`)
- [ ] `GET /api/history/skill-gap` - Retrieve a historical timeline of the user's skill gap evaluations to show progress charts.
- [ ] `GET /api/history/reports` - Fetch previously generated AI skill reports to avoid re-parsing resume data unnecessarily.
