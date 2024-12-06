import React, {useState, useEffect} from 'react';
import {
  Alert,
  TouchableOpacity,
  Text,
  View,
  ScrollView,
  TextInput,
} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {NativeModules} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {removeRecording, updateRecordingName} from '../store/audioSlice';
import Slider from '@react-native-community/slider';

const {AudioModule} = NativeModules;

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const RecordingList = () => {
  const dispatch = useDispatch();
  const recordings = useSelector((state: any) => state.audio.recordings);
  const [editingFile, setEditingFile] = useState<string | null>(null);
  const [newName, setNewName] = useState<string>('');
  const [playingFile, setPlayingFile] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  const updateProgress = async () => {
    if (!playingFile) return;

    try {
      const currentPosition = await AudioModule.getCurrentPosition();
      const totalDuration = await AudioModule.getDuration();

      const currentPositionInSeconds = currentPosition / 1000;
      const totalDurationInSeconds = totalDuration / 1000;

      setDuration(totalDurationInSeconds);

      if (totalDurationInSeconds > 0) {
        const currentProgress =
          (currentPositionInSeconds / totalDurationInSeconds) * 100;
        setProgress(currentProgress);

        if (currentProgress >= 100) {
          setProgress(0);
          setIsPaused(true);
          setPlayingFile(null);
        }
      }
    } catch (error) {
      console.warn('Error getting current position:', error);
    }
  };

  useEffect(() => {
    let animationFrameId: number | null = null;

    const animateProgress = () => {
      if (playingFile) {
        updateProgress();
        animationFrameId = requestAnimationFrame(animateProgress);
      }
    };

    if (playingFile) {
      animateProgress();
    } else {
      setProgress(0);
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [playingFile]);

  const startPlaying = async (filePath: string) => {
    if (playingFile !== filePath) {
      setPlayingFile(filePath);
      setIsPaused(false);
      try {
        await AudioModule.startPlaying(filePath);
        setPlayingFile(null);
        setIsPaused(false);
      } catch (error) {
        console.warn('Error starting playback:', error);
      }
    }
  };

  const pausePlaying = async () => {
    try {
      await AudioModule.pausePlaying();
      setIsPaused(true);
    } catch (error) {
      console.warn('Error pausing playback:', error);
    }
  };

  const resumePlaying = async () => {
    try {
      await AudioModule.resumePlaying();
      setIsPaused(false);
    } catch (error) {
      console.warn('Error resuming playback:', error);
    }
  };

  const deleteRecording = (filePath: string) => {
    Alert.alert(
      'Delete Recording',
      'Are you sure you want to delete this recording?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (playingFile === filePath) {
              pausePlaying();
              setPlayingFile(null);
            }
            dispatch(removeRecording(filePath));
          },
        },
      ],
    );
  };

  const saveNewName = (filePath: string) => {
    if (newName.trim()) {
      const isNameTaken = recordings.some(
        (recording: {name: string; filePath: string}) =>
          recording.name.toLowerCase() === newName.trim().toLowerCase() &&
          recording.filePath !== filePath,
      );

      if (isNameTaken) {
        Alert.alert('Duplicate Name', 'This name is already taken.');
      } else {
        dispatch(updateRecordingName({filePath, newName: newName.trim()}));
        setEditingFile(null);
        setNewName('');
      }
    } else {
      Alert.alert('Invalid Name', 'Name cannot be empty.');
    }
  };

  const reversedRecordings = [...recordings].reverse();

  return (
    <ScrollView className="flex-1 p-4 bg-gray-100">
      <Text className="text-2xl font-bold text-left mb-4">All Notes</Text>
      <View className="flex-row items-center rounded-lg shadow-lg mb-4 px-4 border-b border-gray-300">
        <Ionicons
          name="search"
          size={20}
          color="#6B7280"
          style={{marginRight: 8}}
        />
        <TextInput
          className="flex-1 py-2 px-2 text-purple-800"
          placeholder="Type to search ..."
        />
      </View>
      {reversedRecordings.length > 0 ? (
        reversedRecordings.map(
          (recording: {filePath: string; name: string}, index: number) => (
            <View
              key={index}
              className="flex flex-col p-4 mb-2 bg-white rounded-md shadow-md">
              <View className="flex flex-row items-center justify-between">
                {editingFile === recording.filePath ? (
                  <TextInput
                    value={newName}
                    onChangeText={setNewName}
                    placeholder="Enter new name"
                    className="flex-1 mr-4 border-b border-gray-300"
                    onSubmitEditing={() => saveNewName(recording.filePath)}
                  />
                ) : (
                  <Text className="text-gray-800 font-medium flex-1">
                    {recording.name}
                  </Text>
                )}
                <View className="flex flex-row space-x-2">
                  {playingFile === recording.filePath ? (
                    isPaused ? (
                      <TouchableOpacity onPress={resumePlaying}>
                        <Ionicons
                          name="play-circle"
                          size={32}
                          color="#3b82f6"
                        />
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity onPress={pausePlaying}>
                        <Ionicons
                          name="pause-circle"
                          size={32}
                          color="#3b82f6"
                        />
                      </TouchableOpacity>
                    )
                  ) : (
                    <TouchableOpacity
                      onPress={() => startPlaying(recording.filePath)}>
                      <Ionicons name="play-circle" size={32} color="#3b82f6" />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    onPress={() => {
                      setEditingFile(recording.filePath);
                      setNewName(recording.name);
                    }}>
                    <Ionicons name="create-outline" size={28} color="#10b981" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => deleteRecording(recording.filePath)}>
                    <Ionicons name="trash" size={28} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
              {(playingFile === recording.filePath ||
                editingFile === recording.filePath) && (
                <>
                  <Slider
                    style={{marginTop: 10}}
                    minimumValue={0}
                    maximumValue={100}
                    value={progress}
                    minimumTrackTintColor="#3b82f6"
                    maximumTrackTintColor="#d1d5db"
                    thumbTintColor="#3b82f6"
                  />
                  <View className="flex flex-row justify-between">
                    <Text className="text-gray-500">
                      {formatTime((progress / 100) * duration)}
                    </Text>
                    <Text className="text-gray-500">
                      {formatTime(duration)}
                    </Text>
                  </View>
                </>
              )}
            </View>
          ),
        )
      ) : (
        <Text className="text-center text-gray-500">
          No recordings available.
        </Text>
      )}
    </ScrollView>
  );
};

export default RecordingList;
