export interface ExerciseTemplate {
  name: string;
  category: string;
  muscleGroups: string[];
  formKeyPoints: string[];
  description: string;
}

export const exerciseDatabase: ExerciseTemplate[] = [
  // Lower Body - Squat Pattern
  {
    name: 'Barbell Back Squat',
    category: 'Legs',
    muscleGroups: ['Quadriceps', 'Glutes', 'Hamstrings', 'Core'],
    formKeyPoints: [
      'Feet shoulder-width apart',
      'Knees track over toes',
      'Chest up, neutral spine',
      'Depth to parallel or below',
      'Drive through heels',
    ],
    description: 'Compound lower body exercise with barbell on upper back',
  },
  {
    name: 'Goblet Squat',
    category: 'Legs',
    muscleGroups: ['Quadriceps', 'Glutes', 'Core'],
    formKeyPoints: [
      'Hold weight at chest height',
      'Elbows between knees at bottom',
      'Upright torso',
      'Full depth squat',
    ],
    description: 'Beginner-friendly squat variation holding weight at chest',
  },

  // Lower Body - Hinge Pattern
  {
    name: 'Conventional Deadlift',
    category: 'Back',
    muscleGroups: ['Hamstrings', 'Glutes', 'Lower Back', 'Traps'],
    formKeyPoints: [
      'Neutral spine throughout',
      'Hinge at hips, not spine',
      'Bar stays close to body',
      'Lock out hips and knees together',
      'Shoulders over bar at start',
    ],
    description: 'Hip hinge movement lifting barbell from floor',
  },
  {
    name: 'Romanian Deadlift',
    category: 'Legs',
    muscleGroups: ['Hamstrings', 'Glutes', 'Lower Back'],
    formKeyPoints: [
      'Slight knee bend maintained',
      'Hinge at hips, push hips back',
      'Feel stretch in hamstrings',
      'Neutral spine',
    ],
    description: 'Hamstring-focused deadlift variation',
  },

  // Lower Body - Single Leg
  {
    name: 'Bulgarian Split Squat',
    category: 'Legs',
    muscleGroups: ['Quadriceps', 'Glutes', 'Balance'],
    formKeyPoints: [
      'Front foot flat on ground',
      'Knee tracks over toe',
      'Upright torso',
      'Back knee drops straight down',
    ],
    description: 'Single-leg squat with rear foot elevated',
  },
  {
    name: 'Walking Lunges',
    category: 'Legs',
    muscleGroups: ['Quadriceps', 'Glutes', 'Balance'],
    formKeyPoints: [
      'Long stride forward',
      'Back knee nearly touches ground',
      'Front knee stays over ankle',
      'Upright torso',
    ],
    description: 'Dynamic single-leg movement pattern',
  },

  // Upper Body - Horizontal Push
  {
    name: 'Barbell Bench Press',
    category: 'Chest',
    muscleGroups: ['Chest', 'Triceps', 'Shoulders'],
    formKeyPoints: [
      'Retract shoulder blades',
      'Arch in lower back',
      'Bar touches mid-chest',
      'Elbows at 45-degree angle',
      'Drive feet into ground',
    ],
    description: 'Fundamental horizontal pressing movement',
  },
  {
    name: 'Push-Ups',
    category: 'Chest',
    muscleGroups: ['Chest', 'Triceps', 'Core'],
    formKeyPoints: [
      'Hands shoulder-width apart',
      'Straight body line',
      'Core engaged',
      'Chest touches ground',
      'Full lockout at top',
    ],
    description: 'Bodyweight horizontal press',
  },

  // Upper Body - Vertical Push
  {
    name: 'Overhead Press',
    category: 'Shoulders',
    muscleGroups: ['Shoulders', 'Triceps', 'Core'],
    formKeyPoints: [
      'Bar starts at collarbone',
      'Press straight overhead',
      'Head moves forward after bar passes',
      'Lock out overhead',
      'Core braced',
    ],
    description: 'Standing barbell overhead press',
  },
  {
    name: 'Dumbbell Shoulder Press',
    category: 'Shoulders',
    muscleGroups: ['Shoulders', 'Triceps'],
    formKeyPoints: [
      'Dumbbells at shoulder height',
      'Press up and slightly together',
      'Neutral spine',
      'Controlled descent',
    ],
    description: 'Seated or standing dumbbell overhead press',
  },

  // Upper Body - Horizontal Pull
  {
    name: 'Barbell Row',
    category: 'Back',
    muscleGroups: ['Lats', 'Rhomboids', 'Traps', 'Biceps'],
    formKeyPoints: [
      'Hinge at hips, torso near parallel',
      'Pull to lower chest/upper abdomen',
      'Retract shoulder blades',
      'Elbows close to body',
      'Controlled lowering',
    ],
    description: 'Bent-over horizontal pulling movement',
  },
  {
    name: 'Seated Cable Row',
    category: 'Back',
    muscleGroups: ['Lats', 'Rhomboids', 'Biceps'],
    formKeyPoints: [
      'Upright torso',
      'Pull to lower chest',
      'Squeeze shoulder blades together',
      'Slight lean back acceptable',
    ],
    description: 'Seated horizontal row on cable machine',
  },

  // Upper Body - Vertical Pull
  {
    name: 'Pull-Ups',
    category: 'Back',
    muscleGroups: ['Lats', 'Biceps', 'Upper Back'],
    formKeyPoints: [
      'Dead hang at bottom',
      'Pull chest to bar',
      'Shoulder blades down and back',
      'Avoid excessive swinging',
      'Controlled descent',
    ],
    description: 'Bodyweight vertical pull',
  },
  {
    name: 'Lat Pulldown',
    category: 'Back',
    muscleGroups: ['Lats', 'Biceps', 'Upper Back'],
    formKeyPoints: [
      'Pull bar to upper chest',
      'Lean back slightly',
      'Shoulder blades retracted',
      'Full arm extension at top',
    ],
    description: 'Machine-based vertical pull',
  },

  // Core
  {
    name: 'Plank',
    category: 'Core',
    muscleGroups: ['Abs', 'Core', 'Shoulders'],
    formKeyPoints: [
      'Forearms on ground',
      'Straight body line',
      'Core engaged, no sagging',
      'Neutral neck position',
      'Breathing maintained',
    ],
    description: 'Isometric core stability exercise',
  },
  {
    name: 'Russian Twist',
    category: 'Core',
    muscleGroups: ['Obliques', 'Abs'],
    formKeyPoints: [
      'Lean back at 45 degrees',
      'Rotate from torso, not arms',
      'Controlled movement',
      'Feet elevated or on ground',
    ],
    description: 'Rotational core exercise',
  },

  // Arms
  {
    name: 'Barbell Curl',
    category: 'Arms',
    muscleGroups: ['Biceps', 'Forearms'],
    formKeyPoints: [
      'Elbows fixed at sides',
      'No swinging or momentum',
      'Full range of motion',
      'Squeeze at top',
      'Controlled descent',
    ],
    description: 'Isolation exercise for biceps',
  },
  {
    name: 'Tricep Dips',
    category: 'Arms',
    muscleGroups: ['Triceps', 'Chest', 'Shoulders'],
    formKeyPoints: [
      'Shoulder-width grip',
      'Lower until 90-degree elbow bend',
      'Elbows track backward not outward',
      'Lean slightly forward',
      'Full extension at top',
    ],
    description: 'Bodyweight tricep exercise',
  },
];
