// Navigation types
export type RootStackParamList = {
  MainTabs: undefined;
  ExerciseDetail: { exerciseId: string };
};

export type MainTabParamList = {
  Home: undefined;
  Exercises: undefined;
  Upload: undefined;
  Profile: undefined;
};

// Exercise types
export interface Exercise {
  id: string;
  name: string;
  category: string;
  videoUri?: string;
  thumbnailUri?: string;
  createdAt: Date;
  analysisResult?: FormAnalysis;
}

export interface FormAnalysis {
  score: number;
  feedback: string[];
  keyPoints: {
    timestamp: number;
    issue: string;
    severity: 'low' | 'medium' | 'high';
  }[];
}

// Video types
export interface VideoUpload {
  uri: string;
  fileName: string;
  type: string;
  fileSize: number;
}
