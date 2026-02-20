import os
import logging

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from database import engine, get_db
from models import db_models
from models.schemas import (
    AnalyzeRequest,
    FormAnalysis,
    HealthResponse,
    UserCreate,
    UserResponse,
    ExerciseCreate,
    ExerciseResponse,
    SaveAnalysisRequest,
    AnalysisResultResponse,
)
from services.video import download_video, extract_frames
from services.pose import PoseEstimator
from services.user import get_or_create_user, get_user_by_cognito_id
from services.exercise import (
    create_exercise,
    get_user_exercises,
    delete_exercise,
    save_analysis_result,
)
from analyzers.squat import analyze_squat

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="RepRight API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    db_models.Base.metadata.create_all(bind=engine)
    logger.info("Database tables created/verified")


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------

@app.get("/api/health", response_model=HealthResponse)
def health_check():
    return HealthResponse(status="ok")


# ---------------------------------------------------------------------------
# Users
# ---------------------------------------------------------------------------

@app.post("/api/users", response_model=UserResponse)
def upsert_user(data: UserCreate, db: Session = Depends(get_db)):
    """Create user on first login, or return existing user."""
    return get_or_create_user(db, data)


@app.get("/api/users/{cognito_user_id}", response_model=UserResponse)
def get_user(cognito_user_id: str, db: Session = Depends(get_db)):
    user = get_user_by_cognito_id(db, cognito_user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# ---------------------------------------------------------------------------
# Exercises
# ---------------------------------------------------------------------------

@app.post("/api/exercises", response_model=ExerciseResponse)
def add_exercise(data: ExerciseCreate, db: Session = Depends(get_db)):
    try:
        return create_exercise(db, data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get("/api/exercises/{cognito_user_id}", response_model=list[ExerciseResponse])
def list_exercises(cognito_user_id: str, db: Session = Depends(get_db)):
    return get_user_exercises(db, cognito_user_id)


@app.delete("/api/exercises/{exercise_id}")
def remove_exercise(
    exercise_id: str, cognito_user_id: str, db: Session = Depends(get_db)
):
    success = delete_exercise(db, exercise_id, cognito_user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Exercise not found")
    return {"status": "deleted"}


# ---------------------------------------------------------------------------
# Analysis
# ---------------------------------------------------------------------------

@app.post("/api/exercises/{exercise_id}/analysis", response_model=AnalysisResultResponse)
def add_analysis(
    exercise_id: str, data: SaveAnalysisRequest, db: Session = Depends(get_db)
):
    data.exercise_id = exercise_id
    return save_analysis_result(db, data)


@app.post("/api/analyze", response_model=FormAnalysis)
def analyze_form(request: AnalyzeRequest):
    video_path = None
    try:
        logger.info(f"Analyzing {request.exercise_name} from {request.video_url}")

        logger.info("Downloading video...")
        video_path = download_video(request.video_url)

        logger.info("Extracting frames...")
        frames = extract_frames(video_path, fps=5)
        logger.info(f"Extracted {len(frames)} frames")

        if not frames:
            raise HTTPException(
                status_code=400, detail="Could not extract frames from video"
            )

        logger.info("Running pose estimation...")
        estimator = PoseEstimator()
        pose_data = estimator.process_frames(frames)
        estimator.close()
        logger.info(f"Pose detected in {len(pose_data)}/{len(frames)} frames")

        if not pose_data:
            raise HTTPException(
                status_code=400,
                detail="Could not detect pose in any frames. Ensure the full body is visible.",
            )

        logger.info("Analyzing form...")
        exercise_lower = request.exercise_name.lower()
        if "squat" in exercise_lower:
            result = analyze_squat(pose_data)
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Analysis not yet supported for '{request.exercise_name}'. Currently supported: squats.",
            )

        logger.info(f"Analysis complete. Score: {result.score}")
        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Analysis failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
    finally:
        if video_path and os.path.exists(video_path):
            os.remove(video_path)
