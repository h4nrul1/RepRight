from __future__ import annotations

import mediapipe as mp
from models.schemas import FormAnalysis, KeyPoint
from utils.angles import calculate_angle, angle_to_vertical

mp_pose = mp.solutions.pose
PoseLandmark = mp_pose.PoseLandmark

# Landmark indices
L_SHOULDER = PoseLandmark.LEFT_SHOULDER
R_SHOULDER = PoseLandmark.RIGHT_SHOULDER
L_HIP = PoseLandmark.LEFT_HIP
R_HIP = PoseLandmark.RIGHT_HIP
L_KNEE = PoseLandmark.LEFT_KNEE
R_KNEE = PoseLandmark.RIGHT_KNEE
L_ANKLE = PoseLandmark.LEFT_ANKLE
R_ANKLE = PoseLandmark.RIGHT_ANKLE
L_FOOT = PoseLandmark.LEFT_FOOT_INDEX
R_FOOT = PoseLandmark.RIGHT_FOOT_INDEX

# Rep detection states
STANDING = "STANDING"
DESCENDING = "DESCENDING"
BOTTOM = "BOTTOM"
ASCENDING = "ASCENDING"

STANDING_THRESHOLD = 160
DESCENDING_THRESHOLD = 140
BOTTOM_THRESHOLD = 110


def _lm_xy(landmarks: dict, idx) -> tuple:
    """Extract (x, y) from landmarks dict."""
    return (landmarks[idx][0], landmarks[idx][1])


def _avg_xy(landmarks: dict, idx1, idx2) -> tuple:
    a = _lm_xy(landmarks, idx1)
    b = _lm_xy(landmarks, idx2)
    return ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2)


def _knee_angle(landmarks: dict, side: str = "left") -> float:
    """Calculate hip-knee-ankle angle for given side."""
    if side == "left":
        hip, knee, ankle = L_HIP, L_KNEE, L_ANKLE
    else:
        hip, knee, ankle = R_HIP, R_KNEE, R_ANKLE
    return calculate_angle(
        _lm_xy(landmarks, hip),
        _lm_xy(landmarks, knee),
        _lm_xy(landmarks, ankle),
    )


def _avg_knee_angle(landmarks: dict) -> float:
    return (_knee_angle(landmarks, "left") + _knee_angle(landmarks, "right")) / 2


def detect_reps(
    pose_data: list[tuple[float, dict]],
) -> list[dict]:
    """Detect squat reps using a state machine on knee angle.

    Returns list of reps, each with:
        - bottom_timestamp: float
        - bottom_landmarks: dict
        - min_knee_angle: float
        - descent_start_timestamp: float
        - frames: list of (timestamp, landmarks) during the rep
    """
    if not pose_data:
        return []

    state = STANDING
    reps = []
    current_rep_frames = []
    min_angle = 180.0
    min_angle_timestamp = 0.0
    min_angle_landmarks = None
    descent_start_timestamp = 0.0

    for timestamp, landmarks in pose_data:
        angle = _avg_knee_angle(landmarks)

        if state == STANDING:
            if angle < DESCENDING_THRESHOLD:
                state = DESCENDING
                descent_start_timestamp = timestamp
                min_angle = angle
                min_angle_timestamp = timestamp
                min_angle_landmarks = landmarks
                current_rep_frames = [(timestamp, landmarks)]

        elif state == DESCENDING:
            current_rep_frames.append((timestamp, landmarks))
            if angle < min_angle:
                min_angle = angle
                min_angle_timestamp = timestamp
                min_angle_landmarks = landmarks
            if angle <= BOTTOM_THRESHOLD:
                state = BOTTOM
            elif angle > STANDING_THRESHOLD:
                # Went back up without hitting bottom — partial rep, discard
                state = STANDING
                current_rep_frames = []

        elif state == BOTTOM:
            current_rep_frames.append((timestamp, landmarks))
            if angle < min_angle:
                min_angle = angle
                min_angle_timestamp = timestamp
                min_angle_landmarks = landmarks
            if angle > DESCENDING_THRESHOLD:
                state = ASCENDING

        elif state == ASCENDING:
            current_rep_frames.append((timestamp, landmarks))
            if angle > STANDING_THRESHOLD:
                reps.append(
                    {
                        "bottom_timestamp": min_angle_timestamp,
                        "bottom_landmarks": min_angle_landmarks,
                        "min_knee_angle": min_angle,
                        "descent_start_timestamp": descent_start_timestamp,
                        "frames": current_rep_frames,
                    }
                )
                state = STANDING
                current_rep_frames = []
                min_angle = 180.0

    return reps


def _check_depth(min_knee_angle: float) -> tuple[float, str]:
    """Score depth (30% weight). <90 = full marks."""
    if min_knee_angle <= 90:
        return 1.0, "Good depth — hips below parallel"
    elif min_knee_angle <= 100:
        return 0.7, "Nearly parallel — try to go slightly deeper"
    elif min_knee_angle <= 115:
        return 0.4, "Partial squat — aim for hips at or below knee level"
    else:
        return 0.1, "Shallow squat — significantly more depth needed"


def _check_knee_tracking(bottom_landmarks: dict) -> tuple[float, str]:
    """Score knee tracking (25% weight). Compare knee x vs ankle x for valgus."""
    l_knee_x = _lm_xy(bottom_landmarks, L_KNEE)[0]
    r_knee_x = _lm_xy(bottom_landmarks, R_KNEE)[0]
    l_ankle_x = _lm_xy(bottom_landmarks, L_ANKLE)[0]
    r_ankle_x = _lm_xy(bottom_landmarks, R_ANKLE)[0]

    # Knee valgus: knees collapsing inward (left knee right of left ankle,
    # right knee left of right ankle in normalized coords)
    l_diff = l_knee_x - l_ankle_x  # Positive = knee caving right (inward for left)
    r_diff = r_ankle_x - r_knee_x  # Positive = knee caving left (inward for right)

    max_cave = max(l_diff, r_diff)

    if max_cave < 0.01:
        return 1.0, "Knees tracking well over toes"
    elif max_cave < 0.03:
        return 0.7, "Slight knee valgus — focus on pushing knees outward"
    elif max_cave < 0.05:
        return 0.4, "Knees caving inward — strengthen hip abductors"
    else:
        return 0.1, "Significant knee valgus — reduce weight and work on form"


def _check_torso_angle(bottom_landmarks: dict) -> tuple[float, str]:
    """Score torso angle (25% weight). Shoulder-hip angle vs vertical. <30 = good."""
    mid_shoulder = _avg_xy(bottom_landmarks, L_SHOULDER, R_SHOULDER)
    mid_hip = _avg_xy(bottom_landmarks, L_HIP, R_HIP)

    torso_angle = angle_to_vertical(mid_shoulder, mid_hip)

    if torso_angle < 30:
        return 1.0, "Good torso angle — staying upright"
    elif torso_angle < 45:
        return 0.7, "Slight forward lean — work on thoracic mobility"
    elif torso_angle < 60:
        return 0.4, "Excessive forward lean — strengthen core and upper back"
    else:
        return 0.1, "Very excessive forward lean — risk of lower back strain"


def _check_stance_width(bottom_landmarks: dict) -> tuple[float, str]:
    """Score stance width (10% weight). Foot distance vs shoulder distance ratio."""
    l_foot_x = _lm_xy(bottom_landmarks, L_FOOT)[0]
    r_foot_x = _lm_xy(bottom_landmarks, R_FOOT)[0]
    l_shoulder_x = _lm_xy(bottom_landmarks, L_SHOULDER)[0]
    r_shoulder_x = _lm_xy(bottom_landmarks, R_SHOULDER)[0]

    foot_width = abs(r_foot_x - l_foot_x)
    shoulder_width = abs(r_shoulder_x - l_shoulder_x)

    if shoulder_width < 0.01:
        return 0.5, "Could not reliably measure stance width"

    ratio = foot_width / shoulder_width

    if 0.9 <= ratio <= 1.5:
        return 1.0, "Good stance width"
    elif 0.7 <= ratio < 0.9:
        return 0.6, "Stance slightly narrow — try shoulder width or wider"
    elif 1.5 < ratio <= 2.0:
        return 0.6, "Wide stance — acceptable but may limit depth for some"
    else:
        return 0.3, "Stance width is unusual — aim for shoulder to 1.5x shoulder width"


def _check_hip_hinge(rep: dict) -> tuple[float, str]:
    """Score hip hinge (10% weight). Hip should break before knee at descent start."""
    frames = rep["frames"]
    if len(frames) < 3:
        return 0.5, "Not enough frames to evaluate hip hinge"

    # Look at first few frames of descent
    start_landmarks = frames[0][1]
    early_landmarks = frames[min(2, len(frames) - 1)][1]

    # Hip angle change (shoulder-hip-knee)
    hip_angle_start = calculate_angle(
        _avg_xy(start_landmarks, L_SHOULDER, R_SHOULDER),
        _avg_xy(start_landmarks, L_HIP, R_HIP),
        _avg_xy(start_landmarks, L_KNEE, R_KNEE),
    )
    hip_angle_early = calculate_angle(
        _avg_xy(early_landmarks, L_SHOULDER, R_SHOULDER),
        _avg_xy(early_landmarks, L_HIP, R_HIP),
        _avg_xy(early_landmarks, L_KNEE, R_KNEE),
    )

    # Knee angle change
    knee_start = _avg_knee_angle(start_landmarks)
    knee_early = _avg_knee_angle(early_landmarks)

    hip_change = abs(hip_angle_start - hip_angle_early)
    knee_change = abs(knee_start - knee_early)

    if hip_change >= knee_change:
        return 1.0, "Good hip hinge — hips initiate the movement"
    elif hip_change >= knee_change * 0.5:
        return 0.6, "Try to initiate the squat more with the hips"
    else:
        return 0.2, "Knee-dominant descent — push hips back first"


def analyze_squat(pose_data: list[tuple[float, dict]]) -> FormAnalysis:
    """Run full squat analysis on pose data from video frames."""
    reps = detect_reps(pose_data)

    if not reps:
        return FormAnalysis(
            score=0,
            feedback=["No complete squat reps detected in the video."],
            keyPoints=[],
        )

    # Analyze each rep and average scores
    all_scores = {"depth": [], "knee": [], "torso": [], "stance": [], "hinge": []}
    all_feedback = {}
    key_points = []

    for i, rep in enumerate(reps):
        depth_score, depth_fb = _check_depth(rep["min_knee_angle"])
        knee_score, knee_fb = _check_knee_tracking(rep["bottom_landmarks"])
        torso_score, torso_fb = _check_torso_angle(rep["bottom_landmarks"])
        stance_score, stance_fb = _check_stance_width(rep["bottom_landmarks"])
        hinge_score, hinge_fb = _check_hip_hinge(rep)

        all_scores["depth"].append(depth_score)
        all_scores["knee"].append(knee_score)
        all_scores["torso"].append(torso_score)
        all_scores["stance"].append(stance_score)
        all_scores["hinge"].append(hinge_score)

        # Track worst feedback per category
        for category, (score, fb) in [
            ("depth", (depth_score, depth_fb)),
            ("knee", (knee_score, knee_fb)),
            ("torso", (torso_score, torso_fb)),
            ("stance", (stance_score, stance_fb)),
            ("hinge", (hinge_score, hinge_fb)),
        ]:
            if category not in all_feedback or score < all_feedback[category][0]:
                all_feedback[category] = (score, fb)

        # Add key points for issues
        timestamp = rep["bottom_timestamp"]
        if depth_score < 0.7:
            key_points.append(
                KeyPoint(
                    timestamp=timestamp,
                    issue=depth_fb,
                    severity="high" if depth_score <= 0.1 else "medium",
                )
            )
        if knee_score < 0.7:
            key_points.append(
                KeyPoint(
                    timestamp=timestamp,
                    issue=knee_fb,
                    severity="high" if knee_score <= 0.1 else "medium",
                )
            )
        if torso_score < 0.7:
            key_points.append(
                KeyPoint(
                    timestamp=timestamp,
                    issue=torso_fb,
                    severity="high" if torso_score <= 0.1 else "medium",
                )
            )

    # Calculate weighted average score
    weights = {"depth": 0.30, "knee": 0.25, "torso": 0.25, "stance": 0.10, "hinge": 0.10}

    avg_scores = {}
    for category, scores in all_scores.items():
        avg_scores[category] = sum(scores) / len(scores) if scores else 0

    weighted_score = sum(
        avg_scores[cat] * weight for cat, weight in weights.items()
    )
    final_score = round(weighted_score * 100)
    final_score = max(0, min(100, final_score))

    # Build feedback list — sorted by score (worst first)
    feedback_items = sorted(all_feedback.values(), key=lambda x: x[0])
    feedback = [fb for _, fb in feedback_items]

    # Add rep count info
    feedback.insert(0, f"Detected {len(reps)} rep(s)")

    return FormAnalysis(
        score=final_score,
        feedback=feedback,
        keyPoints=key_points,
    )
