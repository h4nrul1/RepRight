import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {RouteProp, useRoute, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Video from 'react-native-video';
import {RootStackParamList} from '../types';
import {useExercises} from '../context/ExerciseContext';

type ExerciseDetailRouteProp = RouteProp<RootStackParamList, 'ExerciseDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ExerciseDetailScreen() {
  const route = useRoute<ExerciseDetailRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const {getExerciseById, deleteExercise} = useExercises();
  const [paused, setPaused] = useState(true);

  const exercise = getExerciseById(route.params.exerciseId);

  if (!exercise) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Exercise not found</Text>
      </View>
    );
  }

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
          onPress: () => {
            deleteExercise(exercise.id);
            navigation.goBack();
          },
        },
      ],
    );
  };

  return (
    <ScrollView style={styles.container}>
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
            style={styles.analyzeButton}
            onPress={() =>
              Alert.alert(
                'Coming Soon',
                'AI form analysis will be available once backend is implemented',
              )
            }>
            <Text style={styles.analyzeButtonText}>Analyze Form</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
    backgroundColor: 'rgba(74, 144, 226, 0.9)',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  playButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  headerSection: {
    marginBottom: 20,
  },
  exerciseName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  categoryBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  scoreContainer: {
    backgroundColor: '#4A90E2',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#E3F2FD',
    marginBottom: 5,
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  feedbackContainer: {
    marginTop: 10,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  feedbackItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    lineHeight: 20,
  },
  actionSection: {
    marginTop: 10,
  },
  analyzeButton: {
    backgroundColor: '#4A90E2',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  analyzeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF3B30',
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  errorText: {
    fontSize: 18,
    color: '#8E8E93',
  },
});
