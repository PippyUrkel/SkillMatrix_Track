import uuid
from fastapi import APIRouter, HTTPException, Depends
from app.middleware.auth_middleware import get_current_user
from app.features.quiz.llm import generate_quiz_questions
from .schemas import QuizGenerateRequest, QuizGenerateResponse, QuizSubmitRequest, QuizSubmitResponse, QuizQuestion

router = APIRouter(prefix="/api/quiz", tags=["Quiz Generation"])

@router.post("/generate", response_model=QuizGenerateResponse)
async def generate_quiz(request: QuizGenerateRequest, user_id: str = Depends(get_current_user)):
    try:
        formatted_questions = await generate_quiz_questions(
            topic=request.topic,
            num_questions=request.num_questions,
            difficulty=request.difficulty
        )
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
