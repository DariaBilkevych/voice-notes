import React, {useState, useEffect} from 'react';
import {
  TouchableOpacity,
  Text,
  Alert,
  PermissionsAndroid,
  View,
  NativeModules,
} from 'react-native';
import {useDispatch} from 'react-redux';
import {addRecording} from '../store/audioSlice';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SaveRecordingModal from './modals/SaveRecordingModal';
import {formatTime} from '../utils/timeUtils';

const {AudioModule} = NativeModules;

const RecordingPanel = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [amplitudes, setAmplitudes] = useState<number[]>([]);
  const [outputFile, setOutputFile] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (isRecording && !isPaused) {
      timer = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isRecording, isPaused]);

  useEffect(() => {
    let amplitudeInterval: NodeJS.Timeout | undefined;

    if (isRecording && !isPaused) {
      amplitudeInterval = setInterval(updateAmplitude, 100);
    } else {
      clearInterval(amplitudeInterval);
    }

    return () => clearInterval(amplitudeInterval);
  }, [isRecording, isPaused]);

  const updateAmplitude = async () => {
    try {
      const amplitude = await AudioModule.getAmplitude();
      setAmplitudes(prev => {
        const updated = [...prev, amplitude];
        if (updated.length > 50) {
          updated.shift();
        }
        return updated;
      });
    } catch (error) {
      console.warn('Error getting amplitude:', error);
    }
  };

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
        },
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
      Alert.alert(
        'Permission Denied',
        'Microphone permission is required to start recording.',
      );
      return;
    }

    try {
      await AudioModule.startRecording(`recording_${Date.now()}`);
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);
      setAmplitudes([]);
    } catch (error) {
      console.warn('Error starting recording:', error);
    }
  };

  const stopRecording = async () => {
    try {
      await AudioModule.stopRecording();
      const outputFilePath = await AudioModule.getOutputFile();
      setOutputFile(outputFilePath);
      setIsRecording(false);
      setIsPaused(false);
      setRecordingTime(0);
      setIsModalVisible(true);
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

  const handleSave = (name: string) => {
    if (outputFile) {
      dispatch(addRecording({filePath: outputFile, name}));
      setIsModalVisible(false);
      setOutputFile(null);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setOutputFile(null);
  };

  return (
    <View className="w-full p-5 bg-white border-t border-gray-300 flex items-center">
      <View className="flex-row items-center justify-between w-full">
        <Text className="text-lg font-semibold text-gray-800">
          {isRecording ? formatTime(recordingTime) : '0:00'}
        </Text>

        <TouchableOpacity
          onPress={
            !isRecording
              ? startRecording
              : isPaused
              ? resumeRecording
              : pauseRecording
          }
          className="bg-red-500 w-14 h-14 rounded-full flex items-center justify-center">
          <Ionicons
            name={!isRecording ? 'mic' : isPaused ? 'play' : 'pause'}
            size={32}
            color="white"
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={stopRecording}
          disabled={!isRecording}
          className={`p-2 rounded-full border-2 ${
            isRecording ? 'border-green-500' : 'border-gray-300'
          }`}>
          <Ionicons
            name="checkmark"
            size={18}
            color={isRecording ? '#10B981' : '#D1D5DB'}
          />
        </TouchableOpacity>
      </View>

      {isRecording && (
        <View className="w-full h-24 flex-row items-center justify-center mt-5 overflow-hidden">
          {amplitudes.map((value, index) => {
            const lineHeight = (value / 32767) * 50;
            return (
              <View
                key={index}
                className="w-[3px] h-24 mx-[1px] flex-column justify-center items-center">
                <View
                  style={{
                    height: lineHeight,
                  }}
                  className="w-full bg-red-500"
                />
                <View
                  style={{
                    height: lineHeight,
                  }}
                  className="w-full bg-red-500"
                />
              </View>
            );
          })}
        </View>
      )}

      <SaveRecordingModal
        visible={isModalVisible}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </View>
  );
};

export default RecordingPanel;
