import json
import uuid
import httpx
from fastapi import APIRouter, HTTPException, Depends
from json_repair import repair_json
from ...middleware.auth_middleware import get_current_user
from ...config import get_settings
from .schemas import QuizGenerateRequest, QuizGenerateResponse, QuizSubmitRequest, QuizSubmitResponse, QuizQuestion

router = APIRouter(prefix="/api/quiz", tags=["Quiz Generation"])
settings = get_settings()

QUIZ_PROMPT = """You are an expert educational assessment creator. 
Create a multiple-choice quiz about "{topic}" with exactly {num_questions} questions at a {difficulty} difficulty level.

CRITICAL INSTRUCTIONS:
1. Return ONLY valid JSON.
2. Do not include any markdown formatting like ```json or ```.
3. Every question must have exactly 4 options.
4. The correct_answer must be the exact string of one of the options.

Format your response exactly like this:
[
  {{
    "question": "What is...",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_answer": "Option B",
    "explanation": "Option B is correct because..."
  }}
]
"""

@router.post("/generate", response_model=QuizGenerateResponse)
async def generate_quiz(request: QuizGenerateRequest, user_id: str = Depends(get_current_user)):
    try:
        prompt = QUIZ_PROMPT.format(
            topic=request.topic,
            num_questions=request.num_questions,
            difficulty=request.difficulty
        )
        # Make HTTP request to Ollama endpoint
        ollama_url = f"{settings.ollama_endpoint.rstrip('/')}/api/generate"
        payload = {
            "model": settings.ollama_model,
            "prompt": prompt,
            "stream": False
        }
        
        async with httpx.AsyncClient() as client:
            resp = await client.post(ollama_url, json=payload, timeout=60.0)
            resp.raise_for_status()
            response_data = resp.json()
            
        raw_json = response_data.get('response', '')
        
        # Repair and parse the JSON since LLMs can be flaky
        try:
            parsed_questions = json.loads(repair_json(raw_json))
        except Exception as e:
            print(f"JSON Parse Error: {e}")
            print(f"Raw Response: {raw_json}")
            raise HTTPException(status_code=500, detail="Failed to parse quiz from LLM.")
        
        if not isinstance(parsed_questions, list):
            raise HTTPException(status_code=500, detail="Expected list of questions.")
            
        formatted_questions = []
        for q in parsed_questions:
            formatted_questions.append(QuizQuestion(
                id=str(uuid.uuid4()),
                question=q.get("question", "Missing question"),
                options=q.get("options", []),
                correct_answer=q.get("correct_answer", ""),
                explanation=q.get("explanation", "No explanation provided.")
            ))
            
        return QuizGenerateResponse(
            topic=request.topic,
            questions=formatted_questions
        )
        
    except Exception as e:
        print(f"Error generating quiz: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/submit", response_model=QuizSubmitResponse)
async def submit_quiz(request: QuizSubmitRequest, user_id: str = Depends(get_current_user)):
    # Currently a mock submission endpoint that would normally fetch the true answers
    # from the database using the quiz_id.
    # For now, we will rely on frontend comparing the answers for the MVP, 
    # but returning a standard response structure.
    
    return QuizSubmitResponse(
        score=0,
        total=len(request.answers),
        percentage=0.0
    )
