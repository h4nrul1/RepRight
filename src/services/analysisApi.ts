import {FormAnalysis} from '../types';

const API_BASE_URL = __DEV__
  ? 'http://localhost:8000'
  : 'http://localhost:8000'; // TODO: replace with production URL

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
