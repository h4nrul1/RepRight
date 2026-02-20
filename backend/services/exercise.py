from __future__ import annotations

from sqlalchemy.orm import Session

from models.db_models import Exercise, AnalysisResult, User
from models.schemas import ExerciseCreate, SaveAnalysisRequest


def create_exercise(db: Session, data: ExerciseCreate) -> Exercise:
    user = db.query(User).filter(User.cognito_user_id == data.cognito_user_id).first()
    if not user:
        raise ValueError(f"No user found for cognito_user_id: {data.cognito_user_id}")

    exercise = Exercise(
        user_id=user.id,
        name=data.name,
        category=data.category,
        video_url=data.video_url,
        thumbnail_url=data.thumbnail_url,
    )
    db.add(exercise)
    db.commit()
    db.refresh(exercise)
    return exercise


def get_user_exercises(db: Session, cognito_user_id: str) -> list[Exercise]:
    user = db.query(User).filter(User.cognito_user_id == cognito_user_id).first()
    if not user:
        return []
    return (
        db.query(Exercise)
        .filter(Exercise.user_id == user.id)
        .order_by(Exercise.created_at.desc())
        .all()
    )


def delete_exercise(db: Session, exercise_id: str, cognito_user_id: str) -> bool:
    user = db.query(User).filter(User.cognito_user_id == cognito_user_id).first()
    if not user:
        return False

    exercise = (
        db.query(Exercise)
        .filter(Exercise.id == exercise_id, Exercise.user_id == user.id)
        .first()
    )
    if not exercise:
        return False

    db.delete(exercise)
    db.commit()
    return True


def save_analysis_result(db: Session, data: SaveAnalysisRequest) -> AnalysisResult:
    # Replace any existing result for this exercise
    existing = (
        db.query(AnalysisResult)
        .filter(AnalysisResult.exercise_id == data.exercise_id)
        .first()
    )
    if existing:
        db.delete(existing)
        db.commit()

    result = AnalysisResult(
        exercise_id=data.exercise_id,
        score=data.score,
        feedback=data.feedback,
        key_points=data.key_points,
    )
    db.add(result)
    db.commit()
    db.refresh(result)
    return result
