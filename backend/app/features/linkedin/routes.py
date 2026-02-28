from fastapi import APIRouter, HTTPException, Depends
import os
import json
from json_repair import repair_json
from app.middleware.auth_middleware import get_current_user
from app.config import get_settings
from app.utils.llm import generate_text

router = APIRouter(prefix="/api/linkedin", tags=["LinkedIn Integration"])
settings = get_settings()

@router.post("/generate")
async def generate_linkedin_post(request: dict, user_id: str = Depends(get_current_user)):
    """
    Generates a personalized, professional LinkedIn post celebrating course completion.
    """
    course_name = request.get('course_name')
    skills_gained = request.get('skills_gained', [])
    
    if not course_name:
        raise HTTPException(status_code=400, detail="Course name is required.")

    prompt = f"""
    You are an expert technical recruiter and social media manager.
    Write a highly engaging, professional LinkedIn post celebrating the completion of a course.
    The user just completed the course: "{course_name}".
    Skills gained: {', '.join(skills_gained) if skills_gained else 'Various technical skills'}.
    
    Requirements:
    1. Keep it authentic, exciting, and professional (under 150 words).
    2. Include 2-3 relevant hashtags at the bottom.
    3. Do NOT include placeholder text like [User Name] or [Link], just the body of the post.
    4. Focus on the value of the skills gained.
    5. Return ONLY a raw JSON object with a single key "post_content" containing the string. No markdown formatting or extra text.
    """

    try:
        response_text = await generate_text(prompt, temperature=0.7)
        if not response_text:
            raise Exception("No response from Ollama")
        
        # Parse the output
        try:
            parsed = json.loads(str(repair_json(response_text)))
            content = parsed.get("post_content", response_text)
            
            # Clean up potential markdown string artifacts
            if isinstance(content, str) and content.startswith("```json"):
                 content = content.replace("```json\n", "").replace("```", "").strip()
            
            return {"post_content": content.strip()}
            
        except json.JSONDecodeError:
            print("Failed to parse JSON for LinkedIn post. Falling back to raw response.")
            # If JSON parsing totally fails, just return the raw string and let the user edit it.
            return {"post_content": response_text.strip()}

    except Exception as e:
        print(f"Error generating LinkedIn post with Ollama: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate post. Please try again later.")
