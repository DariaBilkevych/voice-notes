import React, {useState, useEffect, useRef} from 'react';
import {
  Alert,
  TouchableOpacity,
  Text,
  View,
  ScrollView,
  TextInput,
} from 'react-native';
import Slider from '@react-native-community/slider';
import {useSelector, useDispatch} from 'react-redux';
import {NativeModules} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {removeRecording, updateRecordingName} from '../store/audioSlice';

const {AudioModule} = NativeModules;

const RecordingList = () => {
  const dispatch = useDispatch();
  const recordings = useSelector((state: any) => state.audio.recordings);
  const [editingFile, setEditingFile] = useState<string | null>(null);
  const [newName, setNewName] = useState<string>('');
  const [playingFile, setPlayingFile] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [durations, setDurations] = useState<{[key: string]: number}>({});
  const [currentPositions, setCurrentPositions] = useState<{
    [key: string]: number;
  }>({});
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (playingFile) {
      AudioModule.getDuration()
        .then((duration: number) =>
          setDurations(prev => ({...prev, [playingFile]: duration})),
        )
        .catch((error: any) => console.warn('Error getting duration:', error));

      intervalRef.current = setInterval(() => {
        AudioModule.getCurrentPosition()
          .then((position: number) =>
            setCurrentPositions(prev => ({...prev, [playingFile]: position})),
          )
          .catch((error: any) =>
            console.warn('Error getting current position:', error),
          );
      }, 1000);
    } else {
      clearInterval(intervalRef.current!);
    }

    return () => clearInterval(intervalRef.current!);
  }, [playingFile]);

  const startPlaying = async (filePath: string) => {
    if (playingFile !== filePath) {
      setPlayingFile(filePath);
      setIsPaused(false);
      setCurrentPositions(prev => ({...prev, [filePath]: 0}));
      try {
        await AudioModule.startPlaying(filePath);
        setPlayingFile(null);
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

  const seekTo = async (filePath: string, value: number) => {
    try {
      await AudioModule.seekTo(value);
      setCurrentPositions(prev => ({...prev, [filePath]: value}));
    } catch (error) {
      console.warn('Error seeking:', error);
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

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = ((milliseconds % 60000) / 1000).toFixed(0);
    return minutes + ':' + (parseInt(seconds) < 10 ? '0' : '') + seconds;
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
              {playingFile === recording.filePath && (
                <View className="flex flex-row items-center">
                  <Text>
                    {formatTime(currentPositions[recording.filePath] || 0)}
                  </Text>
                  <Slider
                    style={{flex: 1}}
                    minimumValue={0}
                    maximumValue={durations[recording.filePath] || 0}
                    value={currentPositions[recording.filePath] || 0}
                    onSlidingComplete={value =>
                      seekTo(recording.filePath, value)
                    }
                  />
                  <Text>{formatTime(durations[recording.filePath] || 0)}</Text>
                </View>
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
