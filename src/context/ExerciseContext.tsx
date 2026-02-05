import React, {createContext, useContext, useState, ReactNode} from 'react';
import {Exercise} from '../types';

interface ExerciseContextType {
  exercises: Exercise[];
  addExercise: (exercise: Omit<Exercise, 'id' | 'createdAt'>) => void;
  updateExercise: (id: string, updates: Partial<Exercise>) => void;
  deleteExercise: (id: string) => void;
  getExerciseById: (id: string) => Exercise | undefined;
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

  const addExercise = (exercise: Omit<Exercise, 'id' | 'createdAt'>) => {
    const newExercise: Exercise = {
      ...exercise,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setExercises(prev => [newExercise, ...prev]);
  };

  const updateExercise = (id: string, updates: Partial<Exercise>) => {
    setExercises(prev =>
      prev.map(exercise =>
        exercise.id === id ? {...exercise, ...updates} : exercise,
      ),
    );
  };

  const deleteExercise = (id: string) => {
    setExercises(prev => prev.filter(exercise => exercise.id !== id));
  };

  const getExerciseById = (id: string) => {
    return exercises.find(exercise => exercise.id === id);
  };

  return (
    <ExerciseContext.Provider
      value={{
        exercises,
        addExercise,
        updateExercise,
        deleteExercise,
        getExerciseById,
      }}>
      {children}
    </ExerciseContext.Provider>
  );
};
