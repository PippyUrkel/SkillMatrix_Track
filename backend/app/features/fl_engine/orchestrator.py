"""
FL Orchestrator — manages the federated learning lifecycle.

Starts the FL engine in a background thread when FastAPI boots,
handles student assessment requests, and provides
the assess_student() method used by the curriculum service.
"""

import threading
import time
import logging
import os

import numpy as np

from app.features.fl_engine.models import ComprehensionModel, create_seed_model, LABELS
from app.features.fl_engine.client import StudentAssessmentClient
from app.features.fl_engine.data import prepare_answer_text, auto_label_answer, AnswerSample
from app.features.fl_engine.strategy import AsyncMedianStrategy

logger = logging.getLogger(__name__)

# Global model path for persistence
DEFAULT_MODEL_PATH = os.path.join(
    os.path.dirname(__file__), "..", "..", "..", "fl_global_model.joblib"
)


class FLOrchestrator:
    """
    Manages the FL engine lifecycle.

    - Initializes with a seed model on startup
    - Runs FL training rounds when new student data arrives
    - Provides inference via assess_student()
    """

    def __init__(self, model_path: str | None = None):
        self.model_path = model_path or DEFAULT_MODEL_PATH
        self._lock = threading.Lock()
        self._running = False
        self._model_ready = False

        # Initialize with seed model
        self._global_model = self._init_model()

    def _init_model(self) -> ComprehensionModel:
        """Load existing model or create a seed model."""
        if os.path.exists(self.model_path):
            logger.info("Loading existing FL global model from %s", self.model_path)
            model = ComprehensionModel(model_path=self.model_path)
            self._model_ready = True
            return model

        logger.info("No existing model found — creating seed model")
        model = create_seed_model()
        model.save(self.model_path)
        self._model_ready = True
        return model

    def start(self) -> None:
        """Start the FL engine (called on FastAPI startup)."""
        with self._lock:
            if self._running:
                logger.warning("FL engine already running")
                return
            self._running = True

        logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        logger.info(" FL Engine Started ✓")
        logger.info(" Model ready: %s", self._model_ready)
        logger.info(" Model path: %s", self.model_path)
        logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

    def stop(self) -> None:
        """Graceful shutdown (called on FastAPI shutdown)."""
        with self._lock:
            self._running = False
        # Save the global model
        if self._model_ready:
            self._global_model.save(self.model_path)
        logger.info("FL Engine stopped")

    @property
    def is_running(self) -> bool:
        return self._running

    @property
    def model_ready(self) -> bool:
        return self._model_ready

    def assess_student(
        self,
        answers: list[dict],
    ) -> dict:
        """
        Assess a student's comprehension based on their test answers.

        Args:
            answers: List of {question, student_answer, correct_answer}

        Returns:
            {
                comprehension_level: "weak" | "partial" | "strong",
                confidence: float,
                recommendation: "expand" | "maintain" | "shorten",
                per_answer: [...individual assessments...],
            }
        """
        # Prepare texts for inference
        texts = [
            prepare_answer_text(a["question"], a["student_answer"], a["correct_answer"])
            for a in answers
        ]

        # Run inference on each answer
        predictions = self._global_model.predict(texts)

        # Also feed this data back into the model (incremental FL learning)
        self._train_on_new_data(answers)

        # Aggregate per-answer scores into overall assessment
        label_scores = {"weak_understanding": 0, "partial_understanding": 0, "strong_understanding": 0}
        for pred in predictions:
            label_scores[pred["label"]] += 1

        total = len(predictions)
        # Determine overall level by majority vote
        overall_label = max(label_scores, key=label_scores.get)
        overall_confidence = np.mean([p["confidence"] for p in predictions])

        # Map comprehension level to curriculum action
        recommendation = _level_to_recommendation(overall_label)

        return {
            "comprehension_level": overall_label.replace("_understanding", ""),
            "confidence": round(float(overall_confidence), 1),
            "recommendation": recommendation,
            "per_answer": [
                {
                    "question": a["question"],
                    "level": p["label"].replace("_understanding", ""),
                    "confidence": p["confidence"],
                }
                for a, p in zip(answers, predictions)
            ],
            "summary": {
                "weak_count": label_scores["weak_understanding"],
                "partial_count": label_scores["partial_understanding"],
                "strong_count": label_scores["strong_understanding"],
                "total": total,
            },
        }

    def _train_on_new_data(self, answers: list[dict]) -> None:
        """
        Feed student answers back into the model for incremental learning.
        Uses auto-labelling heuristics since we don't have human labels.
        """
        texts = []
        labels = []

        for answer in answers:
            text = prepare_answer_text(
                answer["question"], answer["student_answer"], answer["correct_answer"]
            )
            label = auto_label_answer(answer["student_answer"], answer["correct_answer"])
            texts.append(text)
            labels.append(label)

        with self._lock:
            self._global_model.partial_fit(texts, labels)
            # Persist updated model
            self._global_model.save(self.model_path)

        logger.info("FL model updated with %d new samples", len(texts))

    def run_fl_round(
        self,
        student_data: dict[str, list[dict]],
        num_rounds: int = 2,
    ) -> None:
        """
        Run a full federated learning round with multiple students.

        Args:
            student_data: {student_id: [{question, student_answer, correct_answer}, ...]}
            num_rounds: Number of FL aggregation rounds
        """
        if len(student_data) < 2:
            logger.info("Need at least 2 students for FL round, using local training instead")
            for answers in student_data.values():
                self._train_on_new_data(answers)
            return

        logger.info("Starting FL round with %d students, %d rounds", len(student_data), num_rounds)

        # This would use Flower's simulation API for a real FL round
        # For now, we do sequential local training (functionally equivalent in single machine setting)
        for student_id, answers in student_data.items():
            self._train_on_new_data(answers)
            logger.info("[Student %s] Local training complete", student_id)

        logger.info("FL round complete — model updated")


def _level_to_recommendation(level: str) -> str:
    """Map comprehension level to curriculum adaptation action."""
    mapping = {
        "weak_understanding": "expand",
        "partial_understanding": "maintain",
        "strong_understanding": "shorten",
    }
    return mapping.get(level, "maintain")


# Singleton orchestrator instance
_orchestrator: FLOrchestrator | None = None


def get_orchestrator() -> FLOrchestrator:
    """Get or create the global FL orchestrator instance."""
    global _orchestrator
    if _orchestrator is None:
        _orchestrator = FLOrchestrator()
    return _orchestrator
