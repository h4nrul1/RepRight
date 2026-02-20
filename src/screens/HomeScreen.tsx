import React, {useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../types';
import {useExercises} from '../context/ExerciseContext';
import {useTheme} from '../context/ThemeContext';
import {ThemeColors} from '../styles/colors';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const {exercises} = useExercises();
  const {colors} = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const recentExercises = exercises.slice(0, 3);
  const totalExercises = exercises.length;
  const exercisesWithVideos = exercises.filter(e => e.videoUri).length;

  return (
    <ScrollView style={styles.container} contentInsetAdjustmentBehavior="automatic">
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back</Text>
          <Text style={styles.title}>Ready to train?</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>FT</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Exercises</Text>
          <Text style={styles.statNumber}>{totalExercises}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>With Video</Text>
          <Text style={styles.statNumber}>{exercisesWithVideos}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Categories</Text>
          <Text style={styles.statNumber}>
            {[...new Set(exercises.map(e => e.category))].length}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent</Text>
          {recentExercises.length > 0 && (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('MainTabs', {screen: 'Exercises'})
              }>
              <Text style={styles.linkText}>See all ›</Text>
            </TouchableOpacity>
          )}
        </View>
        {recentExercises.length > 0 ? (
          recentExercises.map(exercise => (
            <TouchableOpacity
              key={exercise.id}
              style={styles.exerciseCard}
              onPress={() =>
                navigation.navigate('ExerciseDetail', {
                  exerciseId: exercise.id,
                })
              }>
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.exerciseCategory}>{exercise.category}</Text>
              </View>
              {exercise.videoUri && (
                <View style={styles.videoBadge}>
                  <Text style={styles.videoBadgeText}>Video</Text>
                </View>
              )}
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyText}>No exercises yet</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity
          style={styles.primaryAction}
          onPress={() => navigation.navigate('MainTabs', {screen: 'Upload'})}>
          <Text style={styles.primaryActionText}>Upload New Video</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryAction}
          onPress={() =>
            navigation.navigate('MainTabs', {screen: 'Exercises'})
          }>
          <Text style={styles.secondaryActionText}>View All Exercises</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 16,
    },
    header: {
      paddingVertical: 28,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: {
      fontSize: 30,
      fontWeight: '800',
      color: colors.textPrimary,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    greeting: {
      fontSize: 14,
      color: colors.textMuted,
      marginBottom: 6,
    },
    badge: {
      backgroundColor: colors.highlight,
      borderRadius: 18,
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    badgeText: {
      color: colors.textPrimary,
      fontWeight: '700',
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.surfaceElevated,
      padding: 16,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: 12,
    },
    statNumber: {
      fontSize: 28,
      fontWeight: '800',
      color: colors.textPrimary,
      marginTop: 6,
    },
    statLabel: {
      fontSize: 13,
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    statsRow: {
      flexDirection: 'row',
      paddingBottom: 8,
    },
    section: {
      paddingVertical: 14,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 12,
      letterSpacing: 0.2,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    linkText: {
      color: colors.accent,
      fontWeight: '600',
    },
    exerciseCard: {
      backgroundColor: colors.card,
      padding: 16,
      borderRadius: 14,
      marginBottom: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    exerciseName: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 4,
    },
    exerciseCategory: {
      fontSize: 13,
      color: colors.textMuted,
    },
    videoBadge: {
      backgroundColor: colors.accentMuted,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.accent,
    },
    videoBadgeText: {
      color: colors.accent,
      fontSize: 12,
      fontWeight: '700',
    },
    emptyText: {
      textAlign: 'center',
      color: colors.textMuted,
      fontSize: 16,
      marginTop: 20,
    },
    primaryAction: {
      backgroundColor: colors.accent,
      padding: 16,
      borderRadius: 14,
      alignItems: 'center',
      marginBottom: 10,
    },
    primaryActionText: {
      color: colors.background,
      fontSize: 16,
      fontWeight: '700',
    },
    secondaryAction: {
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: 14,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    secondaryActionText: {
      color: colors.textPrimary,
      fontSize: 16,
      fontWeight: '700',
    },
    exerciseInfo: {
      flex: 1,
    },
  });
