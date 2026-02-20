/**
 * FormTracker App
 * Track your gym form with video analysis
 *
 * @format
 */

import React, {useState} from 'react';
import {StatusBar, ActivityIndicator, View} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import {ExerciseProvider} from './src/context/ExerciseContext';
import {AuthProvider, useAuth} from './src/context/AuthContext';
import SignInScreen from './src/screens/SignInScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import {useTheme, ThemeProvider} from './src/context/ThemeContext';

function AppContent() {
  const {user, isLoading} = useAuth();
  const [showSignUp, setShowSignUp] = useState(false);
  const {colors} = useTheme();

  // Still checking for an existing session
  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background,
        }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  // Not logged in — show auth screens
  if (!user) {
    if (showSignUp) {
      return <SignUpScreen onGoToSignIn={() => setShowSignUp(false)} />;
    }
    return <SignInScreen onGoToSignUp={() => setShowSignUp(true)} />;
  }

  // Logged in — show the main app
  return (
    <ExerciseProvider>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.background}
      />
      <AppNavigator />
    </ExerciseProvider>
  );
}

function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default App;
