from __future__ import annotations

from pydantic import BaseModel
from typing import Literal


class AnalyzeRequest(BaseModel):
    video_url: str
    exercise_name: str


class KeyPoint(BaseModel):
    timestamp: float
    issue: str
    severity: Literal["low", "medium", "high"]


class FormAnalysis(BaseModel):
    score: int
    feedback: list[str]
    keyPoints: list[KeyPoint]


class HealthResponse(BaseModel):
    status: str
