from __future__ import annotations

import os
import tempfile
import urllib.request

import cv2
from dotenv import load_dotenv

load_dotenv()


def download_video(video_url: str) -> str:
    """Download video from a URL (pre-signed S3 or direct) to a temp file."""
    tmp = tempfile.NamedTemporaryFile(suffix=".mp4", delete=False)
    urllib.request.urlretrieve(video_url, tmp.name)
    return tmp.name


def extract_frames(video_path: str, fps: int = 5) -> list[tuple[float, any]]:
    """Extract frames from video at the given FPS rate.

    Returns:
        List of (timestamp_seconds, frame) tuples
    """
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError(f"Could not open video: {video_path}")

    video_fps = cap.get(cv2.CAP_PROP_FPS)
    if video_fps <= 0:
        video_fps = 30.0

    frame_interval = max(1, int(video_fps / fps))
    frames = []
    frame_idx = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        if frame_idx % frame_interval == 0:
            timestamp = frame_idx / video_fps
            frames.append((timestamp, frame))

        frame_idx += 1

    cap.release()
    return frames
