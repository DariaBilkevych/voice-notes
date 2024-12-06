import React, { useState } from 'react';
import { TouchableOpacity, Text, Alert, PermissionsAndroid, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { addRecording } from '../store/audioSlice';
import { NativeModules } from 'react-native';

const { AudioModule } = NativeModules;

const RecordingPanel = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const dispatch = useDispatch();

  const requestMicrophonePermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Audio Recording Permission',
          message: 'This app needs access to your microphone to record audio.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('Failed to request permission:', err);
      return false;
    }
  };

  const startRecording = async () => {
    const hasMicrophonePermission = await requestMicrophonePermission();
    if (!hasMicrophonePermission) {
      Alert.alert('Permission Denied', 'Microphone permission is required to start recording.');
      return;
    }

    try {
      await AudioModule.startRecording(`recording_${Date.now()}`);
      setIsRecording(true);
      setIsPaused(false); // Reset pause state when starting a new recording
    } catch (error) {
      console.warn('Error starting recording:', error);
    }
  };

  const stopRecording = async () => {
    try {
      const result = await AudioModule.stopRecording();
      const outputFile = await AudioModule.getOutputFile();

      dispatch(addRecording(outputFile));
      setIsRecording(false);
      setIsPaused(false); // Reset pause state when stopping the recording
      Alert.alert('Success', result);
    } catch (error) {
      console.warn('Error stopping recording:', error);
    }
  };

  const pauseRecording = async () => {
    try {
      await AudioModule.pauseRecording();
      setIsPaused(true);
    } catch (error) {
      console.warn('Error pausing recording:', error);
    }
  };

  const resumeRecording = async () => {
    try {
      await AudioModule.resumeRecording();
      setIsPaused(false);
    } catch (error) {
      console.warn('Error resuming recording:', error);
    }
  };

  return (
    <View className="absolute bottom-0 w-full p-5 bg-white border-t border-gray-300">
      <View className="flex-row justify-between w-full">
        <TouchableOpacity
          onPress={startRecording}
          disabled={isRecording}
          className="bg-blue-500 p-3 rounded"
        >
          <Text className="text-white font-semibold">Start</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={pauseRecording}
          disabled={!isRecording || isPaused}
          className="bg-yellow-500 p-3 rounded"
        >
          <Text className="text-white font-semibold">Pause</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={resumeRecording}
          disabled={!isRecording || !isPaused}
          className="bg-green-500 p-3 rounded"
        >
          <Text className="text-white font-semibold">Resume</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={stopRecording}
          disabled={!isRecording}
          className="bg-red-500 p-3 rounded"
        >
          <Text className="text-white font-semibold">Stop</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RecordingPanel;
