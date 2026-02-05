# FormTracker Setup Guide

Quick guide to get FormTracker running on your machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **React Native development environment**
  - For iOS: Xcode 14+ (macOS only)
  - For Android: Android Studio with SDK

For detailed React Native environment setup, visit: https://reactnative.dev/docs/environment-setup

## Installation Steps

### 1. Install Dependencies

The npm packages are already installed, but if you need to reinstall:

```bash
npm install
```

### 2. iOS Setup (macOS only)

Install CocoaPods dependencies:

```bash
cd ios
bundle install
bundle exec pod install
cd ..
```

### 3. Run the App

#### For iOS:
```bash
npx react-native run-ios
```

Or open `ios/FormTrackerApp.xcworkspace` in Xcode and click Run.

#### For Android:
Make sure you have an Android emulator running or a device connected, then:

```bash
npx react-native run-android
```

## Project Structure

- `App.tsx` - Main app entry point
- `src/` - All application code
  - `screens/` - Screen components
  - `components/` - Reusable UI components
  - `navigation/` - Navigation setup
  - `context/` - State management
  - `types/` - TypeScript types

## Testing the App

### Sample Data
The app comes with sample exercises pre-loaded:
- Squat (Legs category)
- Bench Press (Chest category)

### Testing Video Upload
1. Go to the "Upload" tab
2. Click "Select Video from Gallery"
3. Choose a video from your device
4. Fill in exercise details
5. Click "Upload Exercise"

### Testing Exercise Management
1. Navigate to "Exercises" tab
2. Search for exercises
3. Filter by category
4. Tap an exercise to view details
5. Play video (if available)
6. Delete exercise if needed

## Common Issues

### iOS Pods Installation Fails
```bash
cd ios
pod deintegrate
pod install
cd ..
```

### Metro Bundler Issues
Clear cache and restart:
```bash
npx react-native start --reset-cache
```

### Build Errors
Clean and rebuild:

**iOS:**
```bash
cd ios
xcodebuild clean
cd ..
```

**Android:**
```bash
cd android
./gradlew clean
cd ..
```

## Development Tips

### Enable Hot Reload
In the app, shake your device or press:
- iOS Simulator: `Cmd + D`
- Android Emulator: `Cmd + M` (macOS) or `Ctrl + M` (Windows/Linux)

Then select "Enable Fast Refresh"

### Debugging
Use Flipper (comes with React Native) or React Native Debugger for debugging.

## Next Steps

The app is now ready for:
1. Backend API integration
2. AI form analysis implementation
3. User authentication
4. Cloud storage for videos
5. Data persistence (AsyncStorage or database)

See `PROJECT_STRUCTURE.md` for more details about the app architecture.

## Troubleshooting

If you encounter any issues:
1. Make sure all dependencies are installed
2. Check that your development environment is properly set up
3. Try cleaning and rebuilding the project
4. Check React Native documentation: https://reactnative.dev/docs/troubleshooting

## License

This project is for demonstration purposes.
