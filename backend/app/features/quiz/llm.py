import json
import uuid
import logging
from json_repair import repair_json
from fastapi import HTTPException
from app.utils.llm import generate_text
from app.features.quiz.schemas import QuizQuestion

logger = logging.getLogger(__name__)

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

async def generate_quiz_questions(topic: str, num_questions: int, difficulty: str) -> list[QuizQuestion]:
    try:
        prompt = QUIZ_PROMPT.format(
            topic=topic,
            num_questions=num_questions,
            difficulty=difficulty
        )
        
        response_text = await generate_text(prompt, temperature=0.3)
        if not response_text:
            raise Exception("No response from Ollama")
        
        # Repair and parse the JSON since LLMs can be flaky
        try:
            parsed_questions = json.loads(repair_json(response_text))
        except Exception as e:
            logger.error(f"JSON Parse Error: {e}")
            logger.error(f"Raw Response: {response_text}")
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
            
        return formatted_questions
        
    except Exception as e:
        logger.error(f"Error generating quiz: {e}")
        raise HTTPException(status_code=500, detail=str(e))
