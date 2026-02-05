# FormTracker App - Project Structure

A React Native app for tracking gym form through video uploads and analysis.

## Project Overview

FormTracker allows users to:
- Upload videos of their gym exercises
- Organize exercises by category (Legs, Chest, Back, Shoulders, Arms, Core)
- View and manage their exercise library
- Prepare for future AI-powered form analysis (backend not yet implemented)

## Folder Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button.tsx       # Custom button component
│   ├── Card.tsx         # Card wrapper component
│   ├── EmptyState.tsx   # Empty state UI
│   ├── LoadingSpinner.tsx # Loading indicator
│   └── index.ts         # Component exports
│
├── context/             # React Context for state management
│   └── ExerciseContext.tsx  # Exercise data management
│
├── navigation/          # Navigation configuration
│   └── AppNavigator.tsx # Main app navigation (Stack + Tabs)
│
├── screens/            # Screen components
│   ├── HomeScreen.tsx          # Dashboard with stats
│   ├── ExercisesScreen.tsx     # Exercise list with search/filter
│   ├── UploadScreen.tsx        # Video upload interface
│   ├── ProfileScreen.tsx       # User profile and settings
│   └── ExerciseDetailScreen.tsx # Exercise details with video player
│
├── types/              # TypeScript type definitions
│   └── index.ts        # App-wide types
│
└── utils/              # Utility functions (for future use)
```

## Key Features Implemented

### 1. Navigation
- **Bottom Tab Navigation**: Home, Exercises, Upload, Profile
- **Stack Navigation**: For detailed views (Exercise Detail screen)
- Uses React Navigation v6

### 2. Screens

#### Home Screen
- Quick stats overview (total exercises, videos)
- Recent exercises list
- Quick action buttons

#### Exercises Screen
- Full exercise list with search
- Category filters (All, Legs, Chest, Back, etc.)
- Shows which exercises have videos

#### Upload Screen
- Video picker from gallery
- Exercise metadata form (name, description, category)
- Form validation
- Success feedback

#### Exercise Detail Screen
- Video player with play/pause controls
- Exercise information display
- Delete functionality
- Placeholder for future AI analysis

#### Profile Screen
- User statistics
- Settings placeholders
- App information

### 3. State Management
- Context API for exercise data
- Sample data included for testing
- CRUD operations: Create, Read, Update, Delete exercises

### 4. Components
- Reusable Button component with variants
- Card wrapper for consistent styling
- EmptyState for no-data scenarios
- LoadingSpinner for async operations

### 5. Video Handling
- Uses `react-native-image-picker` for video selection
- Uses `react-native-video` for playback
- Supports local video URIs

## Technology Stack

- **React Native** (v0.82.1)
- **TypeScript** - Type safety
- **React Navigation** - Navigation
  - @react-navigation/native
  - @react-navigation/native-stack
  - @react-navigation/bottom-tabs
- **react-native-image-picker** - Video/image selection
- **react-native-video** - Video playback
- **React Context API** - State management

## Permissions Configured

### iOS (Info.plist)
- Camera access
- Photo library read
- Photo library write

### Android (AndroidManifest.xml)
- Camera
- Read media video
- Read/write external storage

## Running the App

### iOS
```bash
cd ios
bundle install
bundle exec pod install
cd ..
npx react-native run-ios
```

### Android
```bash
npx react-native run-android
```

## Next Steps (Not Implemented)

The following features are placeholders for future development:

1. **Backend Integration**
   - API endpoints for exercise storage
   - User authentication
   - Cloud video storage

2. **AI Form Analysis**
   - Video processing
   - Pose detection
   - Form scoring and feedback
   - Key point identification

3. **Additional Features**
   - Exercise history and progress tracking
   - Social sharing
   - Workout plans
   - Exercise recommendations

## Data Structure

### Exercise Type
```typescript
interface Exercise {
  id: string;
  name: string;
  description: string;
  category: string;
  videoUri?: string;
  thumbnailUri?: string;
  createdAt: Date;
  analysisResult?: FormAnalysis;
}
```

### Form Analysis Type (Future)
```typescript
interface FormAnalysis {
  score: number;
  feedback: string[];
  keyPoints: {
    timestamp: number;
    issue: string;
    severity: 'low' | 'medium' | 'high';
  }[];
}
```

## Notes

- All exercise data is stored in-memory (Context)
- No persistence implemented yet (data resets on app restart)
- Video files are stored locally on device
- Backend/API integration is not implemented
- AI analysis features are placeholders only
