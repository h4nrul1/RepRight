import os
import logging

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from models.schemas import AnalyzeRequest, FormAnalysis, HealthResponse
from services.video import download_video, extract_frames
from services.pose import PoseEstimator
from analyzers.squat import analyze_squat

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="FormTracker Analysis API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health", response_model=HealthResponse)
def health_check():
    return HealthResponse(status="ok")


@app.post("/api/analyze", response_model=FormAnalysis)
def analyze_form(request: AnalyzeRequest):
    video_path = None
    try:
        logger.info(f"Analyzing {request.exercise_name} from {request.video_url}")

        # Step 1: Download video from S3
        logger.info("Downloading video...")
        video_path = download_video(request.video_url)

        # Step 2: Extract frames at 5 FPS
        logger.info("Extracting frames...")
        frames = extract_frames(video_path, fps=5)
        logger.info(f"Extracted {len(frames)} frames")

        if not frames:
            raise HTTPException(status_code=400, detail="Could not extract frames from video")

        # Step 3: Run pose estimation
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

        # Step 4: Run exercise-specific analysis
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
