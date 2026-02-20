from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel


# ---------------------------------------------------------------------------
# Existing analysis schemas
# ---------------------------------------------------------------------------

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


# ---------------------------------------------------------------------------
# User schemas
# ---------------------------------------------------------------------------

class UserCreate(BaseModel):
    cognito_user_id: str
    email: str
    display_name: Optional[str] = None


class UserResponse(BaseModel):
    id: str
    cognito_user_id: str
    email: str
    display_name: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Exercise schemas
# ---------------------------------------------------------------------------

class ExerciseCreate(BaseModel):
    cognito_user_id: str
    name: str
    category: str
    video_url: Optional[str] = None
    thumbnail_url: Optional[str] = None


class AnalysisResultResponse(BaseModel):
    id: str
    score: int
    feedback: list[str]
    key_points: list[dict]
    analyzed_at: datetime

    model_config = {"from_attributes": True}


class ExerciseResponse(BaseModel):
    id: str
    name: str
    category: str
    video_url: Optional[str]
    thumbnail_url: Optional[str]
    created_at: datetime
    analysis_result: Optional[AnalysisResultResponse] = None

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Analysis save schema
# ---------------------------------------------------------------------------

class SaveAnalysisRequest(BaseModel):
    exercise_id: str
    score: int
    feedback: list[str]
    key_points: list[dict]
