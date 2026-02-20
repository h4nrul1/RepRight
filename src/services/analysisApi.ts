import {FormAnalysis, Exercise} from '../types';

const API_BASE_URL = __DEV__
  ? 'http://localhost:8000'
  : 'http://localhost:8000'; // TODO: replace with production URL

// ---------------------------------------------------------------------------
// Form analysis
// ---------------------------------------------------------------------------

export async function analyzeForm(
  videoUrl: string,
  exerciseName: string,
): Promise<FormAnalysis> {
  const response = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      video_url: videoUrl,
      exercise_name: exerciseName,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({detail: 'Unknown error'}));
    throw new Error(error.detail || `Analysis failed (${response.status})`);
  }

  return response.json();
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export async function upsertUser(
  cognitoUserId: string,
  email: string,
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/users`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({cognito_user_id: cognitoUserId, email}),
  });

  if (!response.ok) {
    throw new Error('Failed to sync user with database');
  }
}

// ---------------------------------------------------------------------------
// Exercises
// ---------------------------------------------------------------------------

function mapExercise(e: any): Exercise {
  return {
    id: e.id,
    name: e.name,
    category: e.category,
    videoUri: e.video_url ?? undefined,
    thumbnailUri: e.thumbnail_url ?? undefined,
    createdAt: new Date(e.created_at),
    analysisResult: e.analysis_result
      ? {
          score: e.analysis_result.score,
          feedback: e.analysis_result.feedback,
          keyPoints: e.analysis_result.key_points,
        }
      : undefined,
  };
}

export async function fetchExercises(cognitoUserId: string): Promise<Exercise[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/exercises/${cognitoUserId}`,
  );

  if (!response.ok) {
    throw new Error('Failed to fetch exercises');
  }

  const data = await response.json();
  return data.map(mapExercise);
}

export async function saveExercise(
  cognitoUserId: string,
  exercise: {
    name: string;
    category: string;
    videoUri?: string;
    thumbnailUri?: string;
  },
): Promise<Exercise> {
  const response = await fetch(`${API_BASE_URL}/api/exercises`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      cognito_user_id: cognitoUserId,
      name: exercise.name,
      category: exercise.category,
      video_url: exercise.videoUri ?? null,
      thumbnail_url: exercise.thumbnailUri ?? null,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to save exercise');
  }

  return mapExercise(await response.json());
}

export async function removeExercise(
  exerciseId: string,
  cognitoUserId: string,
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/exercises/${exerciseId}?cognito_user_id=${encodeURIComponent(cognitoUserId)}`,
    {method: 'DELETE'},
  );

  if (!response.ok) {
    throw new Error('Failed to delete exercise');
  }
}

export async function saveAnalysisResult(
  exerciseId: string,
  analysis: FormAnalysis,
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/exercises/${exerciseId}/analysis`,
    {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        exercise_id: exerciseId,
        score: analysis.score,
        feedback: analysis.feedback,
        key_points: analysis.keyPoints,
      }),
    },
  );

  if (!response.ok) {
    throw new Error('Failed to save analysis result');
  }
}
