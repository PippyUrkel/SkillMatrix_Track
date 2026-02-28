from pydantic import BaseModel
from typing import List

class QuizGenerateRequest(BaseModel):
    topic: str
    difficulty: str = "medium"
    num_questions: int = 5

class QuizQuestion(BaseModel):
    id: str
    question: str
    options: List[str]
    correct_answer: str
    explanation: str

class QuizGenerateResponse(BaseModel):
    topic: str
    questions: List[QuizQuestion]

class QuizAnswerSubmission(BaseModel):
    question_id: str
    selected_answer: str

class QuizSubmitRequest(BaseModel):
    quiz_id: str # For future persistence
    answers: List[QuizAnswerSubmission]

class QuizSubmitResponse(BaseModel):
    score: int
    total: int
    percentage: float
