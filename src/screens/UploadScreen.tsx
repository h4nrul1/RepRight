import React, {useMemo, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import {useExercises} from '../context/ExerciseContext';
import {VideoUpload} from '../types';
import {exerciseDatabase, ExerciseTemplate} from '../data/exerciseDatabase';
import {uploadVideoToS3} from '../utils/s3Uploads';
import {useAuth} from '../context/AuthContext';
import {useTheme} from '../context/ThemeContext';
import {ThemeColors} from '../styles/colors';

export default function UploadScreen() {
  const {addExercise} = useExercises();
  const {user} = useAuth();
  const {colors} = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [selectedVideo, setSelectedVideo] = useState<VideoUpload | null>(null);
  const [selectedExercise, setSelectedExercise] =
    useState<ExerciseTemplate | null>(null);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleSelectVideo = async () => {
    const result = await launchImageLibrary({
      mediaType: 'video',
      selectionLimit: 1,
    });

    if (result.didCancel) {
      return;
    }

    if (result.errorCode) {
      Alert.alert('Error', result.errorMessage || 'Failed to select video');
      return;
    }

    if (result.assets && result.assets[0]) {
      const asset = result.assets[0];
      setSelectedVideo({
        uri: asset.uri || '',
        fileName: asset.fileName || 'video.mp4',
        type: asset.type || 'video/mp4',
        fileSize: asset.fileSize || 0,
      });
    }
  };

  const handleUpload = async () => {
    if (!selectedExercise) {
      Alert.alert('Error', 'Please select an exercise');
      return;
    }

    if (!selectedVideo) {
      Alert.alert('Error', 'Please select a video');
      return;
    }

    setUploading(true);
    try {
      const videoUrl = await uploadVideoToS3(
        selectedVideo.uri,
        user?.userId || 'unknown',
        selectedExercise.name,
      );

      await addExercise({
        name: selectedExercise.name,
        category: selectedExercise.category,
        videoUri: videoUrl,
      });

      setSelectedVideo(null);
      setSelectedExercise(null);

      Alert.alert('Success', 'Exercise uploaded successfully!');
    } catch (error) {
      Alert.alert('Upload Failed', 'Could not upload video. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentInsetAdjustmentBehavior="automatic">
      <View style={styles.header}>
        <Text style={styles.title}>Upload Exercise</Text>
        <Text style={styles.subtitle}>
          Record and analyze your gym form
        </Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Exercise *</Text>
          {selectedExercise ? (
            <View style={styles.exerciseSelected}>
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{selectedExercise.name}</Text>
                <Text style={styles.exerciseCategory}>
                  {selectedExercise.category} • {selectedExercise.muscleGroups.join(', ')}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.changeButton}
                onPress={() => setShowExercisePicker(true)}>
                <Text style={styles.changeButtonText}>Change</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.selectExerciseButton}
              onPress={() => setShowExercisePicker(true)}>
              <Text style={styles.selectExerciseText}>
                Select Exercise from Database
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Video *</Text>
          {selectedVideo ? (
            <View style={styles.videoSelected}>
              <View style={styles.videoInfo}>
                <Text style={styles.videoFileName}>
                  {selectedVideo.fileName}
                </Text>
                <Text style={styles.videoFileSize}>
                  {(selectedVideo.fileSize / 1024 / 1024).toFixed(2)} MB
                </Text>
              </View>
              <TouchableOpacity
                style={styles.changeButton}
                onPress={handleSelectVideo}>
                <Text style={styles.changeButtonText}>Change</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.selectVideoButton}
              onPress={handleSelectVideo}>
              <Text style={styles.selectVideoText}>Select Video from Gallery</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.uploadButton,
            (!selectedExercise || !selectedVideo || uploading) && styles.uploadButtonDisabled,
          ]}
          onPress={handleUpload}
          disabled={!selectedExercise || !selectedVideo || uploading}>
          {uploading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.uploadButtonText}>Upload Exercise</Text>
          )}
        </TouchableOpacity>
      </View>

      <Modal
        visible={showExercisePicker}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowExercisePicker(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Exercise</Text>
            <TouchableOpacity onPress={() => setShowExercisePicker(false)}>
              <Text style={styles.modalClose}>Cancel</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={exerciseDatabase}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => (
              <TouchableOpacity
                style={styles.exerciseItem}
                onPress={() => {
                  setSelectedExercise(item);
                  setShowExercisePicker(false);
                }}>
                <View style={styles.exerciseItemContent}>
                  <Text style={styles.exerciseItemName}>{item.name}</Text>
                  <Text style={styles.exerciseItemDetails}>
                    {item.category} • {item.muscleGroups.join(', ')}
                  </Text>
                  <Text style={styles.exerciseItemDescription}>
                    {item.description}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      </Modal>
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
      padding: 20,
      paddingTop: 60,
    },
    title: {
      fontSize: 28,
      fontWeight: '800',
      color: colors.textPrimary,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    formContainer: {
      padding: 20,
    },
    inputGroup: {
      marginBottom: 24,
    },
    label: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 8,
    },
    selectExerciseButton: {
      backgroundColor: colors.surface,
      padding: 20,
      borderRadius: 14,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderStyle: 'dashed',
    },
    selectExerciseText: {
      color: colors.accent,
      fontSize: 16,
      fontWeight: '700',
    },
    exerciseSelected: {
      backgroundColor: colors.card,
      padding: 15,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    exerciseInfo: {
      flex: 1,
    },
    exerciseName: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 4,
    },
    exerciseCategory: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    selectVideoButton: {
      backgroundColor: colors.surface,
      padding: 40,
      borderRadius: 14,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderStyle: 'dashed',
    },
    selectVideoText: {
      color: colors.accent,
      fontSize: 16,
      fontWeight: '700',
    },
    videoSelected: {
      backgroundColor: colors.card,
      padding: 15,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    videoInfo: {
      flex: 1,
    },
    videoFileName: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 4,
    },
    videoFileSize: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    changeButton: {
      backgroundColor: colors.accentMuted,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.accent,
    },
    changeButtonText: {
      color: colors.accent,
      fontSize: 14,
      fontWeight: '700',
    },
    uploadButton: {
      backgroundColor: colors.accent,
      padding: 16,
      borderRadius: 14,
      alignItems: 'center',
      marginTop: 10,
    },
    uploadButtonDisabled: {
      backgroundColor: colors.highlight,
    },
    uploadButtonText: {
      color: colors.background,
      fontSize: 17,
      fontWeight: '800',
    },
    modalContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    modalHeader: {
      backgroundColor: colors.background,
      padding: 20,
      paddingTop: 60,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    modalTitle: {
      fontSize: 24,
      fontWeight: '800',
      color: colors.textPrimary,
    },
    modalClose: {
      fontSize: 16,
      color: colors.accent,
      fontWeight: '700',
    },
    exerciseItem: {
      backgroundColor: colors.card,
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    exerciseItemContent: {
      flex: 1,
    },
    exerciseItemName: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 4,
    },
    exerciseItemDetails: {
      fontSize: 14,
      color: colors.accent,
      marginBottom: 6,
    },
    exerciseItemDescription: {
      fontSize: 13,
      color: colors.textMuted,
      lineHeight: 18,
    },
    separator: {
      height: 1,
      backgroundColor: colors.border,
    },
  });
