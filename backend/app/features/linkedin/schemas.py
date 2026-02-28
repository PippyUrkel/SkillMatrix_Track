from pydantic import BaseModel
from typing import List

class LinkedInGenerateRequest(BaseModel):
    course_name: str
    skills_gained: List[str]

class LinkedInGenerateResponse(BaseModel):
    post_content: str
