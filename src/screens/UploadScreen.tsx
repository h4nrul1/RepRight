import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import {useExercises} from '../context/ExerciseContext';
import {VideoUpload} from '../types';
import {exerciseDatabase, ExerciseTemplate} from '../data/exerciseDatabase';

export default function UploadScreen() {
  const {addExercise} = useExercises();
  const [selectedVideo, setSelectedVideo] = useState<VideoUpload | null>(null);
  const [selectedExercise, setSelectedExercise] =
    useState<ExerciseTemplate | null>(null);
  const [showExercisePicker, setShowExercisePicker] = useState(false);

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

  const handleUpload = () => {
    if (!selectedExercise) {
      Alert.alert('Error', 'Please select an exercise');
      return;
    }

    if (!selectedVideo) {
      Alert.alert('Error', 'Please select a video');
      return;
    }

    // Add exercise to context
    addExercise({
      name: selectedExercise.name,
      category: selectedExercise.category,
      videoUri: selectedVideo.uri,
    });

    // Reset form
    setSelectedVideo(null);
    setSelectedExercise(null);

    Alert.alert('Success', 'Exercise uploaded successfully!', [
      {
        text: 'OK',
        onPress: () => {},
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
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
            (!selectedExercise || !selectedVideo) && styles.uploadButtonDisabled,
          ]}
          onPress={handleUpload}
          disabled={!selectedExercise || !selectedVideo}>
          <Text style={styles.uploadButtonText}>Upload Exercise</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#4A90E2',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#E3F2FD',
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  selectExerciseButton: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4A90E2',
    borderStyle: 'dashed',
  },
  selectExerciseText: {
    color: '#4A90E2',
    fontSize: 16,
    fontWeight: '600',
  },
  exerciseSelected: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  exerciseCategory: {
    fontSize: 12,
    color: '#8E8E93',
  },
  selectVideoButton: {
    backgroundColor: '#FFFFFF',
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4A90E2',
    borderStyle: 'dashed',
  },
  selectVideoText: {
    color: '#4A90E2',
    fontSize: 16,
    fontWeight: '600',
  },
  videoSelected: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  videoInfo: {
    flex: 1,
  },
  videoFileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  videoFileSize: {
    fontSize: 12,
    color: '#8E8E93',
  },
  changeButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  changeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  uploadButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  uploadButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  modalHeader: {
    backgroundColor: '#4A90E2',
    padding: 20,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalClose: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  exerciseItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  exerciseItemContent: {
    flex: 1,
  },
  exerciseItemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  exerciseItemDetails: {
    fontSize: 14,
    color: '#4A90E2',
    marginBottom: 6,
  },
  exerciseItemDescription: {
    fontSize: 13,
    color: '#8E8E93',
    lineHeight: 18,
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
  },
});
