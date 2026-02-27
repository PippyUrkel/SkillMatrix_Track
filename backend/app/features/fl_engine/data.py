"""
Data utilities for student assessment FL.

Prepares student test answer data for the comprehension model.
"""

from dataclasses import dataclass


@dataclass
class AnswerSample:
    """A single test answer with its comprehension label."""
    question: str
    student_answer: str
    correct_answer: str
    label: int  # 0=weak, 1=partial, 2=strong


def prepare_answer_text(question: str, student_answer: str, correct_answer: str) -> str:
    """
    Combine question, student answer, and correct answer into a single
    text representation for the model.

    The model learns to judge how well the student_answer matches the
    correct_answer in the context of the question.
    """
    return (
        f"Question: {question} "
        f"Student answered: {student_answer} "
        f"Expected answer: {correct_answer}"
    )


def prepare_batch(samples: list[AnswerSample]) -> tuple[list[str], list[int]]:
    """Convert a list of AnswerSamples into texts and labels for the model."""
    texts = [
        prepare_answer_text(s.question, s.student_answer, s.correct_answer)
        for s in samples
    ]
    labels = [s.label for s in samples]
    return texts, labels


def auto_label_answer(student_answer: str, correct_answer: str) -> int:
    """
    Heuristic auto-labelling for when we don't have human labels.

    Compares word overlap between student answer and correct answer
    to estimate comprehension level.

    Returns: 0=weak, 1=partial, 2=strong
    """
    if not student_answer.strip():
        return 0  # weak — empty answer

    student_words = set(student_answer.lower().split())
    correct_words = set(correct_answer.lower().split())

    # Remove common stop words for better comparison
    stop_words = {
        "the", "a", "an", "is", "are", "was", "were", "be", "been",
        "being", "have", "has", "had", "do", "does", "did", "will",
        "would", "could", "should", "may", "might", "can", "shall",
        "to", "of", "in", "for", "on", "with", "at", "by", "from",
        "it", "its", "this", "that", "these", "those", "and", "or",
        "but", "not", "no", "if", "then", "than", "so", "as",
    }

    student_meaningful = student_words - stop_words
    correct_meaningful = correct_words - stop_words

    if not correct_meaningful:
        return 1  # partial — can't compare

    overlap = len(student_meaningful & correct_meaningful)
    overlap_ratio = overlap / len(correct_meaningful)

    # Also consider answer length relative to expected
    length_ratio = len(student_answer) / max(len(correct_answer), 1)

    if overlap_ratio >= 0.5 and length_ratio >= 0.3:
        return 2  # strong
    elif overlap_ratio >= 0.2 or length_ratio >= 0.2:
        return 1  # partial
    else:
        return 0  # weak
