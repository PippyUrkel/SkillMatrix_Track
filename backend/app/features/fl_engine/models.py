"""
Comprehension Assessment Model (Lightweight).

Uses scikit-learn TF-IDF + SGDClassifier for text classification.
Replaces the heavy PyTorch/DistilBert approach to keep deps under 100MB.
The FL architecture (federated clients, async aggregation) stays the same —
Flower exchanges NumPy parameter arrays regardless of the ML framework.
"""

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import SGDClassifier
from sklearn.pipeline import Pipeline
import joblib
import os
import logging

logger = logging.getLogger(__name__)

# Comprehension levels
LABELS = ["weak_understanding", "partial_understanding", "strong_understanding"]
LABEL_TO_IDX = {label: idx for idx, label in enumerate(LABELS)}
IDX_TO_LABEL = {idx: label for idx, label in enumerate(LABELS)}


class ComprehensionModel:
    """
    Lightweight text classifier for student answer comprehension.

    Uses TF-IDF vectorization + SGD linear classifier.
    Classifies answers into: weak / partial / strong understanding.
    Compatible with Flower's NumPyClient parameter exchange.
    """

    def __init__(self, model_path: str | None = None):
        self.vectorizer = TfidfVectorizer(
            max_features=5000,
            ngram_range=(1, 2),
            stop_words="english",
        )
        self.classifier = SGDClassifier(
            loss="modified_huber",   # gives probability estimates
            max_iter=1000,
            random_state=42,
            class_weight="balanced",
            warm_start=True,         # reuse previous weights on re-fit
        )
        self._is_fitted = False
        # Accumulate recent training data for incremental re-fitting
        self._recent_texts: list[str] = []
        self._recent_labels: list[int] = []
        self._max_recent = 200  # keep last N samples for incremental training

        if model_path and os.path.exists(model_path):
            self.load(model_path)

    def fit(self, texts: list[str], labels: list[int]) -> "ComprehensionModel":
        """Train the model on labelled answer data."""
        X = self.vectorizer.fit_transform(texts)
        self.classifier.fit(X, labels)
        self._is_fitted = True
        return self

    def partial_fit(self, texts: list[str], labels: list[int]) -> "ComprehensionModel":
        """
        Incremental training (used by FL clients for local updates).

        Uses warm_start re-fitting: accumulates recent data and re-fits
        the classifier from its current weights. This avoids the sklearn
        partial_fit/fit incompatibility.
        """
        if not self._is_fitted:
            return self.fit(texts, labels)

        # Accumulate new data
        self._recent_texts.extend(texts)
        self._recent_labels.extend(labels)

        # Keep only the most recent samples
        if len(self._recent_texts) > self._max_recent:
            self._recent_texts = self._recent_texts[-self._max_recent:]
            self._recent_labels = self._recent_labels[-self._max_recent:]

        # Ensure all classes are represented (warm_start needs same dimension)
        fit_texts = list(self._recent_texts)
        fit_labels = list(self._recent_labels)
        present_classes = set(fit_labels)
        sentinel_texts = ["weak sentinel", "partial sentinel", "strong sentinel"]
        for cls_idx in range(len(LABELS)):
            if cls_idx not in present_classes:
                fit_texts.append(sentinel_texts[cls_idx])
                fit_labels.append(cls_idx)

        # Re-fit with warm_start (uses previous weights as starting point)
        X = self.vectorizer.transform(fit_texts)
        self.classifier.fit(X, fit_labels)
        return self

    def predict(self, texts: list[str]) -> list[dict]:
        """Predict comprehension level for each text."""
        if not self._is_fitted:
            # Return default assessment if model hasn't been trained yet
            return [
                {"label": "partial_understanding", "confidence": 50.0, "label_idx": 1}
                for _ in texts
            ]

        X = self.vectorizer.transform(texts)
        predictions = self.classifier.predict(X)
        probabilities = self.classifier.predict_proba(X)

        results = []
        for pred_idx, probs in zip(predictions, probabilities):
            confidence = float(np.max(probs) * 100)
            results.append({
                "label": IDX_TO_LABEL[int(pred_idx)],
                "confidence": min(confidence, 99.9),
                "label_idx": int(pred_idx),
            })
        return results

    def get_parameters(self) -> list[np.ndarray]:
        """Extract model parameters as NumPy arrays (for Flower FL)."""
        if not self._is_fitted:
            return []
        params = [
            self.classifier.coef_.copy(),
            self.classifier.intercept_.copy(),
        ]
        return params

    def set_parameters(self, parameters: list[np.ndarray]) -> None:
        """Set model parameters from NumPy arrays (for Flower FL)."""
        if len(parameters) >= 2:
            self.classifier.coef_ = parameters[0]
            self.classifier.intercept_ = parameters[1]
            self._is_fitted = True

    def save(self, path: str) -> None:
        """Save the full pipeline to disk."""
        joblib.dump({
            "vectorizer": self.vectorizer,
            "classifier": self.classifier,
            "is_fitted": self._is_fitted,
        }, path)
        logger.info("Model saved to %s", path)

    def load(self, path: str) -> None:
        """Load a saved model from disk."""
        try:
            data = joblib.load(path)
            self.vectorizer = data["vectorizer"]
            self.classifier = data["classifier"]
            self._is_fitted = data["is_fitted"]
            logger.info("Model loaded from %s", path)
        except Exception as e:
            logger.warning("Failed to load model from %s: %s", path, e)


def create_seed_model() -> ComprehensionModel:
    """
    Create a seed model pre-trained on synthetic comprehension data.
    This gives the FL system a starting point before real student data arrives.
    """
    texts, labels = _generate_seed_data()
    model = ComprehensionModel()
    model.fit(texts, labels)
    return model


def _generate_seed_data() -> tuple[list[str], list[int]]:
    """Generate synthetic training data for bootstrapping the model."""

    weak_answers = [
        "I don't know",
        "not sure about this",
        "I think it's something with computers",
        "maybe sorting or something",
        "can't remember",
        "it has to do with code I think",
        "no idea really",
        "something about loops maybe",
        "I forgot what this means",
        "not confident in my answer",
        "I guess it's related to programming",
        "don't understand the question",
        "random guess here",
        "this is confusing to me",
        "I haven't studied this topic yet",
        "probably wrong but variables",
        "I think databases maybe",
        "not really sure how to explain",
        "something I heard in class once",
        "my answer is probably incorrect",
    ]

    partial_answers = [
        "A variable stores data but I'm not sure about types",
        "Loops repeat code, like for loops",
        "Functions are reusable blocks of code",
        "An array holds multiple values",
        "Object oriented programming uses classes",
        "SQL is used for databases somehow",
        "APIs let programs talk to each other",
        "recursion is when a function calls itself",
        "sorting puts things in order using algorithms",
        "a stack is last in first out I believe",
        "binary search is faster than linear search",
        "inheritance lets classes share properties",
        "TCP is a protocol for network communication",
        "Big O notation measures algorithm speed",
        "a hash table uses keys to store values",
        "polymorphism means many forms in OOP",
        "Git is version control for tracking changes",
        "REST APIs use HTTP methods like GET and POST",
        "machine learning trains models on data",
        "threads allow parallel execution in programs",
    ]

    strong_answers = [
        "A variable is a named memory location that stores a value with a specific type such as int, string, or boolean. Variables must be declared before use in statically typed languages.",
        "A for loop iterates over a sequence with an initialization, condition, and increment step. While loops continue until the condition is false. Both can be nested for multi-dimensional iteration.",
        "Functions encapsulate reusable logic with defined parameters and return types. They promote DRY principles, improve readability, and support recursion and higher-order usage.",
        "Arrays are contiguous memory structures with O(1) access by index. Dynamic arrays like ArrayList resize automatically. Linked lists offer O(1) insertion but O(n) access.",
        "OOP encapsulates data and behavior in classes. Key principles: encapsulation hides internal state, inheritance enables code reuse, polymorphism allows interface-based programming, and abstraction hides complexity.",
        "SQL (Structured Query Language) performs CRUD operations on relational databases. Joins (INNER, LEFT, RIGHT) combine tables. Indexes optimize query performance at the cost of write speed.",
        "REST APIs follow HTTP semantics: GET retrieves resources, POST creates, PUT updates, DELETE removes. Stateless design with JSON payloads. Status codes indicate success (2xx) or failure (4xx, 5xx).",
        "Recursion solves problems by breaking them into smaller subproblems. Requires a base case to prevent infinite recursion. Stack frames track each call. Tail recursion can be optimized by compilers.",
        "Quicksort uses divide-and-conquer with O(n log n) average time. Picks a pivot, partitions elements. Mergesort guarantees O(n log n) but requires O(n) extra space. Both are comparison-based sorts.",
        "A stack follows LIFO (Last In, First Out) with push/pop operations in O(1). Used in function call management, expression evaluation, and undo mechanisms. Can be implemented with arrays or linked lists.",
        "Binary search on a sorted array runs in O(log n) by halving the search space each step. Requires random access. Variants include lower_bound and upper_bound for range queries.",
        "Inheritance creates an is-a relationship between classes. The subclass extends the superclass, inheriting fields and methods. Method overriding enables runtime polymorphism via virtual dispatch tables.",
        "TCP provides reliable, ordered, connection-based byte streams using three-way handshake, sequence numbers, and acknowledgments. UDP is connectionless and faster but unreliable. TCP uses congestion control (slow start, AIMD).",
        "Big O describes upper-bound time/space complexity. O(1) constant, O(log n) logarithmic, O(n) linear, O(n log n) linearithmic, O(n²) quadratic. Amortized analysis averages over sequences of operations.",
        "Hash tables map keys to values using a hash function. Collisions handled by chaining (linked lists) or open addressing (linear/quadratic probing). Average O(1) lookup, worst case O(n) with poor hash function.",
        "Polymorphism enables treating objects of different classes through a common interface. Compile-time (method overloading) and runtime (method overriding via vtables). Supports open-closed principle in SOLID.",
        "Git tracks content changes using SHA-1 hashes in a DAG of commits. Branches are movable pointers. Merge commits combine histories. Rebase replays commits linearly. The staging area buffers changes before commits.",
        "REST APIs use uniform resource identifiers, stateless communication, and HATEOAS for discoverability. Authentication via JWT or OAuth2. Rate limiting and pagination (offset/cursor) handle scale. OpenAPI for documentation.",
        "Supervised ML trains models on labeled data to minimize a loss function via gradient descent. Overfitting is mitigated by regularization, cross-validation, and early stopping. Evaluation metrics: accuracy, precision, recall, F1.",
        "Threads share process memory, enabling concurrency. Race conditions occur when threads access shared state without synchronization. Mutexes, semaphores, and monitors enforce mutual exclusion. Deadlock requires all four Coffman conditions.",
    ]

    texts = weak_answers + partial_answers + strong_answers
    labels = (
        [LABEL_TO_IDX["weak_understanding"]] * len(weak_answers)
        + [LABEL_TO_IDX["partial_understanding"]] * len(partial_answers)
        + [LABEL_TO_IDX["strong_understanding"]] * len(strong_answers)
    )

    return texts, labels
