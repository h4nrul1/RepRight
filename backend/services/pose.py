from __future__ import annotations

import mediapipe as mp
import numpy as np

mp_pose = mp.solutions.pose


class PoseEstimator:
    def __init__(self):
        self.pose = mp_pose.Pose(
            static_image_mode=True,
            model_complexity=1,
            min_detection_confidence=0.5,
        )

    def process_frame(self, frame: np.ndarray) -> dict | None:
        """Run pose estimation on a single frame.

        Returns:
            Dict mapping landmark index to (x, y, visibility) in normalized coords,
            or None if no pose detected.
        """
        results = self.pose.process(frame)

        if not results.pose_landmarks:
            return None

        landmarks = {}
        for idx, lm in enumerate(results.pose_landmarks.landmark):
            landmarks[idx] = (lm.x, lm.y, lm.visibility)

        return landmarks

    def process_frames(
        self, frames: list[tuple[float, np.ndarray]]
    ) -> list[tuple[float, dict]]:
        """Process multiple frames and return those with detected poses.

        Args:
            frames: List of (timestamp, frame) tuples

        Returns:
            List of (timestamp, landmarks) tuples for frames where pose was detected
        """
        results = []
        for timestamp, frame in frames:
            landmarks = self.process_frame(frame)
            if landmarks is not None:
                results.append((timestamp, landmarks))
        return results

    def close(self):
        self.pose.close()
