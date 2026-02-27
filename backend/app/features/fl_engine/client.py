"""
Flower-compatible FL Client for Student Comprehension Assessment.

Each client represents one student's local assessment data.
The federated approach means the global model improves from all students
without sharing raw answer data — preserving privacy.

NOTE: This module implements the FL client pattern directly without
the Flower framework dependency (incompatible with Python 3.13 + numpy 2.x).
The FedAvg aggregation logic is in strategy.py.
"""

import numpy as np
import logging

from app.features.fl_engine.models import ComprehensionModel, LABELS

logger = logging.getLogger(__name__)


class StudentAssessmentClient:
    """
    FL client for federated student assessment.

    Each client holds a student's local test answers and trains
    the comprehension model on them before sharing parameters.
    """

    def __init__(
        self,
        client_id: str,
        model: ComprehensionModel,
        texts: list[str],
        labels: list[int],
    ):
        self.client_id = client_id
        self.model = model
        self.texts = texts
        self.labels = labels

    def get_parameters(self) -> list[np.ndarray]:
        """Return model parameters as NumPy arrays."""
        params = self.model.get_parameters()
        if not params:
            return [
                np.zeros((len(LABELS), 5000)),
                np.zeros(len(LABELS)),
            ]
        return params

    def set_parameters(self, parameters: list[np.ndarray]) -> None:
        """Receive global model parameters from the server."""
        self.model.set_parameters(parameters)

    def fit(self, parameters: list[np.ndarray]) -> tuple[list[np.ndarray], int]:
        """Local training round on this student's data."""
        self.set_parameters(parameters)
        self.model.partial_fit(self.texts, self.labels)
        logger.info("[Client %s] Local training on %d samples", self.client_id, len(self.texts))
        return self.get_parameters(), len(self.texts)

    def evaluate(self, parameters: list[np.ndarray]) -> tuple[float, int, float]:
        """Evaluate the global model on local data."""
        self.set_parameters(parameters)
        predictions = self.model.predict(self.texts)
        correct = sum(
            1 for pred, true_label in zip(predictions, self.labels)
            if pred["label_idx"] == true_label
        )
        accuracy = correct / len(self.labels) if self.labels else 0.0
        loss = 1.0 - accuracy
        return float(loss), len(self.labels), float(accuracy)
