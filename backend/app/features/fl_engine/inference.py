"""
Inference API for FL comprehension assessment.

Thin wrapper around the orchestrator for direct inference calls.
"""

from app.features.fl_engine.orchestrator import get_orchestrator


def assess_comprehension(
    student_answer: str,
    correct_answer: str,
    question: str = "",
) -> dict:
    """
    Assess how well a student understands material based on their answer.

    Args:
        student_answer: The student's response text
        correct_answer: The expected/correct answer
        question: The question that was asked (optional context)

    Returns:
        {label, confidence, recommendation}
    """
    orchestrator = get_orchestrator()
    result = orchestrator.assess_student([
        {
            "question": question or "Assessment question",
            "student_answer": student_answer,
            "correct_answer": correct_answer,
        }
    ])

    return {
        "label": result["comprehension_level"],
        "confidence": result["confidence"],
        "recommendation": result["recommendation"],
    }


def assess_batch(answers: list[dict]) -> dict:
    """
    Assess multiple answers at once.

    Args:
        answers: List of {question, student_answer, correct_answer}

    Returns:
        Full assessment result with per-answer breakdown
    """
    orchestrator = get_orchestrator()
    return orchestrator.assess_student(answers)
