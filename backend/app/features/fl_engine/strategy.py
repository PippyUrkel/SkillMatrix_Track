"""
Async Median Aggregation Strategy for FL.

Implements FedAvg with median-based aggregation directly,
without the Flower framework dependency.

Buffers the last K client updates and computes element-wise median
for robust aggregation against outlier/malicious updates.
"""

import numpy as np
import logging

logger = logging.getLogger(__name__)


class AsyncMedianStrategy:
    """
    FedAvg variant with median-based aggregation.

    Instead of weighted averaging, buffers the last K updates
    and computes element-wise median — robust against outliers.
    """

    def __init__(self, k_buffer_size: int = 3):
        self.K = k_buffer_size
        self.update_buffer: list[list[np.ndarray]] = []

    def aggregate(
        self,
        client_updates: list[tuple[list[np.ndarray], int]],
    ) -> list[np.ndarray] | None:
        """
        Aggregate client model updates using buffered median.

        Args:
            client_updates: List of (parameters, num_examples) tuples

        Returns:
            Aggregated parameters or None if no updates
        """
        if not client_updates:
            return None

        # Add updates to buffer
        for weights, _num_examples in client_updates:
            self.update_buffer.append(weights)

        # Keep only the last K updates
        if len(self.update_buffer) > self.K:
            self.update_buffer = self.update_buffer[-self.K:]

        # Compute median across the buffer (robust against outliers)
        try:
            median_weights = []
            for layer_idx in range(len(self.update_buffer[0])):
                layer_updates = [
                    buffer_weights[layer_idx]
                    for buffer_weights in self.update_buffer
                ]
                median_weights.append(np.median(layer_updates, axis=0))
            return median_weights
        except Exception as e:
            logger.error("Aggregation failed: %s", e)
            return None


class FedAvgStrategy:
    """
    Standard Federated Averaging (FedAvg) strategy.

    Weighted average of client parameters based on dataset size.
    """

    def aggregate(
        self,
        client_updates: list[tuple[list[np.ndarray], int]],
    ) -> list[np.ndarray] | None:
        """
        Aggregate using weighted average.

        Args:
            client_updates: List of (parameters, num_examples) tuples

        Returns:
            Aggregated parameters or None if no updates
        """
        if not client_updates:
            return None

        total_examples = sum(n for _, n in client_updates)
        if total_examples == 0:
            return None

        # Weighted average across all clients
        try:
            num_layers = len(client_updates[0][0])
            averaged = []
            for layer_idx in range(num_layers):
                weighted_sum = sum(
                    weights[layer_idx] * (n / total_examples)
                    for weights, n in client_updates
                )
                averaged.append(weighted_sum)
            return averaged
        except Exception as e:
            logger.error("FedAvg aggregation failed: %s", e)
            return None
