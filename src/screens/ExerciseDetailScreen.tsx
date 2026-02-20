import React, {useMemo, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {RouteProp, useRoute, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Video from 'react-native-video';
import {RootStackParamList} from '../types';
import {useExercises} from '../context/ExerciseContext';
import {analyzeForm, saveAnalysisResult} from '../services/analysisApi';
import {useTheme} from '../context/ThemeContext';
import {ThemeColors} from '../styles/colors';

type ExerciseDetailRouteProp = RouteProp<RootStackParamList, 'ExerciseDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ExerciseDetailScreen() {
  const route = useRoute<ExerciseDetailRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const {getExerciseById, deleteExercise, updateExercise} = useExercises();
  const [paused, setPaused] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const {colors} = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const exercise = getExerciseById(route.params.exerciseId);

  if (!exercise) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Exercise not found</Text>
      </View>
    );
  }

  const handleAnalyze = async () => {
    if (!exercise.videoUri) {
      Alert.alert('No Video', 'Upload a video before analyzing form.');
      return;
    }

    setAnalyzing(true);
    try {
      const result = await analyzeForm(exercise.videoUri, exercise.name);
      await saveAnalysisResult(exercise.id, result);
      updateExercise(exercise.id, {analysisResult: result});
    } catch (error: any) {
      Alert.alert('Analysis Failed', error.message || 'Something went wrong');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Exercise',
      'Are you sure you want to delete this exercise?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteExercise(exercise.id);
            navigation.goBack();
          },
        },
      ],
    );
  };

  return (
    <ScrollView style={styles.container} contentInsetAdjustmentBehavior="automatic">
      {exercise.videoUri && (
        <View style={styles.videoContainer}>
          <Video
            source={{uri: exercise.videoUri}}
            style={styles.video}
            paused={paused}
            controls={true}
            resizeMode="contain"
            onError={error => console.log('Video Error:', error)}
          />
          <TouchableOpacity
            style={styles.playButton}
            onPress={() => setPaused(!paused)}>
            <Text style={styles.playButtonText}>
              {paused ? 'Play' : 'Pause'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.headerSection}>
          <Text style={styles.exerciseName}>{exercise.name}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{exercise.category}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date Added:</Text>
            <Text style={styles.detailValue}>
              {new Date(exercise.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Category:</Text>
            <Text style={styles.detailValue}>{exercise.category}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Has Video:</Text>
            <Text style={styles.detailValue}>
              {exercise.videoUri ? 'Yes' : 'No'}
            </Text>
          </View>
        </View>

        {exercise.analysisResult && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Form Analysis</Text>
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreLabel}>Form Score</Text>
              <Text style={styles.scoreValue}>
                {exercise.analysisResult.score}/100
              </Text>
            </View>
            <View style={styles.feedbackContainer}>
              <Text style={styles.feedbackTitle}>Feedback:</Text>
              {exercise.analysisResult.feedback.map((item, index) => (
                <Text key={index} style={styles.feedbackItem}>
                  • {item}
                </Text>
              ))}
            </View>
          </View>
        )}

        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[styles.analyzeButton, analyzing && styles.analyzeButtonDisabled]}
            onPress={handleAnalyze}
            disabled={analyzing}>
            {analyzing ? (
              <View style={styles.analyzingRow}>
                <ActivityIndicator color={colors.background} size="small" />
                <Text style={styles.analyzeButtonText}> Analyzing...</Text>
              </View>
            ) : (
              <Text style={styles.analyzeButtonText}>Analyze Form</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>Delete Exercise</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    videoContainer: {
      backgroundColor: '#000',
      aspectRatio: 16 / 9,
    },
    video: {
      width: '100%',
      height: '100%',
    },
    playButton: {
      position: 'absolute',
      bottom: 20,
      alignSelf: 'center',
      backgroundColor: colors.accent,
      paddingHorizontal: 30,
      paddingVertical: 12,
      borderRadius: 25,
    },
    playButtonText: {
      color: colors.background,
      fontSize: 16,
      fontWeight: '700',
    },
    content: {
      padding: 20,
    },
    headerSection: {
      marginBottom: 20,
    },
    exerciseName: {
      fontSize: 28,
      fontWeight: '800',
      color: colors.textPrimary,
      marginBottom: 10,
    },
    categoryBadge: {
      backgroundColor: colors.highlight,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      alignSelf: 'flex-start',
      borderWidth: 1,
      borderColor: colors.border,
    },
    categoryText: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '700',
    },
    section: {
      backgroundColor: colors.card,
      padding: 15,
      borderRadius: 14,
      marginBottom: 15,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 10,
    },
    description: {
      fontSize: 16,
      color: colors.textSecondary,
      lineHeight: 24,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    detailLabel: {
      fontSize: 14,
      color: colors.textMuted,
    },
    detailValue: {
      fontSize: 14,
      color: colors.textPrimary,
      fontWeight: '700',
    },
    scoreContainer: {
      backgroundColor: colors.accent,
      padding: 20,
      borderRadius: 12,
      alignItems: 'center',
      marginBottom: 15,
    },
    scoreLabel: {
      fontSize: 14,
      color: colors.background,
      marginBottom: 5,
    },
    scoreValue: {
      fontSize: 36,
      fontWeight: '800',
      color: colors.background,
    },
    feedbackContainer: {
      marginTop: 10,
    },
    feedbackTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 10,
    },
    feedbackItem: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 6,
      lineHeight: 20,
    },
    actionSection: {
      marginTop: 10,
    },
    analyzeButton: {
      backgroundColor: colors.accent,
      padding: 16,
      borderRadius: 14,
      alignItems: 'center',
      marginBottom: 10,
    },
    analyzeButtonDisabled: {
      backgroundColor: colors.highlight,
    },
    analyzingRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    analyzeButtonText: {
      color: colors.background,
      fontSize: 16,
      fontWeight: '700',
    },
    deleteButton: {
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: 14,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.danger,
    },
    deleteButtonText: {
      color: colors.danger,
      fontSize: 16,
      fontWeight: '700',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    errorText: {
      fontSize: 18,
      color: colors.textSecondary,
    },
  });
