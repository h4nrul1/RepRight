import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import {Exercise} from '../types';
import {useAuth} from './AuthContext';
import {
  fetchExercises,
  saveExercise,
  removeExercise,
  upsertUser,
} from '../services/analysisApi';

interface ExerciseContextType {
  exercises: Exercise[];
  isLoading: boolean;
  addExercise: (exercise: Omit<Exercise, 'id' | 'createdAt'>) => Promise<void>;
  updateExercise: (id: string, updates: Partial<Exercise>) => void;
  deleteExercise: (id: string) => Promise<void>;
  getExerciseById: (id: string) => Exercise | undefined;
  refreshExercises: () => Promise<void>;
}

const ExerciseContext = createContext<ExerciseContextType | undefined>(
  undefined,
);

export const useExercises = () => {
  const context = useContext(ExerciseContext);
  if (!context) {
    throw new Error('useExercises must be used within ExerciseProvider');
  }
  return context;
};

interface ExerciseProviderProps {
  children: ReactNode;
}

export const ExerciseProvider: React.FC<ExerciseProviderProps> = ({
  children,
}) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const {user} = useAuth();

  // Sync user to DB and load their exercises whenever they log in
  useEffect(() => {
    if (user) {
      syncUserAndLoad();
    } else {
      setExercises([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId]);

  const syncUserAndLoad = async () => {
    if (!user) {
      return;
    }
    try {
      await upsertUser(user.userId, user.email);
      await refreshExercises();
    } catch (error) {
      console.error('Failed to sync user or load exercises:', error);
    }
  };

  const refreshExercises = async () => {
    if (!user) {
      return;
    }
    setIsLoading(true);
    try {
      const data = await fetchExercises(user.userId);
      setExercises(data);
    } catch (error) {
      console.error('Failed to fetch exercises:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addExercise = async (
    exercise: Omit<Exercise, 'id' | 'createdAt'>,
  ) => {
    if (!user) {
      return;
    }
    const saved = await saveExercise(user.userId, exercise);
    setExercises(prev => [saved, ...prev]);
  };

  const updateExercise = (id: string, updates: Partial<Exercise>) => {
    setExercises(prev =>
      prev.map(exercise =>
        exercise.id === id ? {...exercise, ...updates} : exercise,
      ),
    );
  };

  const deleteExercise = async (id: string) => {
    if (!user) {
      return;
    }
    await removeExercise(id, user.userId);
    setExercises(prev => prev.filter(exercise => exercise.id !== id));
  };

  const getExerciseById = (id: string) => {
    return exercises.find(exercise => exercise.id === id);
  };

  return (
    <ExerciseContext.Provider
      value={{
        exercises,
        isLoading,
        addExercise,
        updateExercise,
        deleteExercise,
        getExerciseById,
        refreshExercises,
      }}>
      {children}
    </ExerciseContext.Provider>
  );
};
