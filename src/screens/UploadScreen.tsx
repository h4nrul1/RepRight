import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import {useExercises} from '../context/ExerciseContext';
import {VideoUpload} from '../types';

export default function UploadScreen() {
  const {addExercise} = useExercises();
  const [selectedVideo, setSelectedVideo] = useState<VideoUpload | null>(null);
  const [exerciseName, setExerciseName] = useState('');
  const [category, setCategory] = useState('Legs');

  const categories = ['Legs', 'Chest', 'Back', 'Shoulders', 'Arms', 'Core'];

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
    if (!exerciseName.trim()) {
      Alert.alert('Error', 'Please enter an exercise name');
      return;
    }

    if (!selectedVideo) {
      Alert.alert('Error', 'Please select a video');
      return;
    }

    // Add exercise to context
    addExercise({
      name: exerciseName,
      category,
      videoUri: selectedVideo.uri,
    });

    // Reset form
    setSelectedVideo(null);
    setExerciseName('');
    setCategory('Legs');

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
          <Text style={styles.label}>Exercise Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Barbell Squat"
            value={exerciseName}
            onChangeText={setExerciseName}
            placeholderTextColor="#BDBDBD"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category *</Text>
          <View style={styles.categoryContainer}>
            {categories.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  category === cat && styles.categoryChipActive,
                ]}
                onPress={() => setCategory(cat)}>
                <Text
                  style={[
                    styles.categoryChipText,
                    category === cat && styles.categoryChipTextActive,
                  ]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
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
            (!exerciseName || !selectedVideo) && styles.uploadButtonDisabled,
          ]}
          onPress={handleUpload}
          disabled={!exerciseName || !selectedVideo}>
          <Text style={styles.uploadButtonText}>Upload Exercise</Text>
        </TouchableOpacity>
      </View>
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
  input: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textArea: {
    minHeight: 100,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  categoryChipActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
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
});
