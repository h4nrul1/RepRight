import React, {useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {useExercises} from '../context/ExerciseContext';
import {useTheme} from '../context/ThemeContext';
import {ThemeColors} from '../styles/colors';

export default function ProfileScreen() {
  const {exercises} = useExercises();
  const {colors, mode, setMode, scheme} = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const stats = {
    totalExercises: exercises.length,
    totalVideos: exercises.filter(e => e.videoUri).length,
    categories: [...new Set(exercises.map(e => e.category))].length,
  };

  const cycleMode = () => {
    if (mode === 'system') setMode('light');
    else if (mode === 'light') setMode('dark');
    else setMode('system');
  };

  const modeLabel =
    mode === 'system' ? `System (${scheme})` : mode === 'light' ? 'Light' : 'Dark';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>FT</Text>
        </View>
        <Text style={styles.name}>FormTracker User</Text>
        <Text style={styles.email}>user@formtracker.com</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalExercises}</Text>
            <Text style={styles.statLabel}>Exercises</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalVideos}</Text>
            <Text style={styles.statLabel}>Videos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.categories}</Text>
            <Text style={styles.statLabel}>Categories</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>Notification Preferences</Text>
          <Text style={styles.settingChevron}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>Video Quality</Text>
          <Text style={styles.settingChevron}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem} onPress={cycleMode}>
          <Text style={styles.settingText}>Theme</Text>
          <Text style={styles.settingValue}>{modeLabel}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>Help & Support</Text>
          <Text style={styles.settingChevron}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>Terms of Service</Text>
          <Text style={styles.settingChevron}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>Privacy Policy</Text>
          <Text style={styles.settingChevron}>›</Text>
        </TouchableOpacity>
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
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
    header: {
      backgroundColor: colors.background,
      padding: 30,
      paddingTop: 60,
      alignItems: 'center',
    },
    avatarContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 15,
      borderWidth: 1,
      borderColor: colors.border,
    },
    avatarText: {
      fontSize: 32,
      fontWeight: '800',
      color: colors.textPrimary,
    },
    name: {
      fontSize: 24,
      fontWeight: '800',
      color: colors.textPrimary,
      marginBottom: 5,
    },
    email: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    section: {
      padding: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 15,
    },
    statsGrid: {
      flexDirection: 'row',
      gap: 10,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.card,
      padding: 15,
      borderRadius: 14,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    statNumber: {
      fontSize: 28,
      fontWeight: '800',
      color: colors.accent,
      marginBottom: 5,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    settingItem: {
      backgroundColor: colors.card,
      padding: 16,
      borderRadius: 14,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    settingText: {
      fontSize: 16,
      color: colors.textPrimary,
    },
    settingChevron: {
      fontSize: 24,
      color: colors.textMuted,
    },
    settingValue: {
      fontSize: 16,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    versionContainer: {
      alignItems: 'center',
      marginTop: 20,
    },
    versionText: {
      fontSize: 14,
      color: colors.textMuted,
    },
  });
