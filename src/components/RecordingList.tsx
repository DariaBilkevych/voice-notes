import React, {useState} from 'react';
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
import {
  removeRecording,
  updateRecordingName,
  setCurrentlyPlaying,
} from '../store/audioSlice';
import {validateRecordingName} from '../validators/validateRecordingName';

const {AudioModule} = NativeModules;

const RecordingList = () => {
  const dispatch = useDispatch();
  const recordings = useSelector((state: any) => state.audio.recordings);
  const [editingFile, setEditingFile] = useState<string | null>(null);
  const [newName, setNewName] = useState<string>('');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const playingFile = useSelector(
    (state: any) => state.audio.currentlyPlayingFile,
  );
  const isRecording = useSelector((state: any) => state.audio.isRecording);

  const startPlaying = async (filePath: string) => {
    if (playingFile !== filePath) {
      dispatch(setCurrentlyPlaying(filePath));
      setIsPaused(false);
      try {
        await AudioModule.startPlaying(filePath);
        dispatch(setCurrentlyPlaying(null));
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
              setCurrentlyPlaying(null);
            }
            dispatch(removeRecording(filePath));
          },
        },
      ],
    );
  };

  const saveNewName = (filePath: string) => {
    if (newName.trim()) {
      const errors = validateRecordingName(
        newName,
        recordings.map((r: any) => r.name),
      );

      if (errors.length > 0) {
        Alert.alert('Validation Error', errors.join('\n'));
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
    <View className="flex-1">
      {isRecording && (
        <View className="absolute top-0 left-0 right-0 bottom-0 bg-black/75 z-20" />
      )}
      <View className="py-3 px-4 z-10">
        <Text className="text-2xl font-bold text-left">All Notes</Text>
        <View className="flex-row items-center rounded-lg shadow-lg mt-2 px-4 border-b border-gray-300">
          <Ionicons
            name="search"
            size={20}
            color="#6B7280"
            style={{marginRight: 8}}
          />
          <TextInput
            className="flex-1 py-2 px-2"
            placeholder="Type to search ..."
          />
        </View>
      </View>
      <ScrollView className="flex-1 p-4 bg-gray-100">
        {reversedRecordings.length > 0 ? (
          reversedRecordings.map(
            (
              recording: {filePath: string; name: string; createdAt: string},
              index: number,
            ) => (
              <View
                key={index}
                className="flex flex-row items-center justify-between p-4 mb-2 bg-white rounded-md shadow-md">
                <View>
                  {editingFile === recording.filePath ? (
                    <TextInput
                      value={newName}
                      onChangeText={setNewName}
                      placeholder="Enter new name"
                      className="w-48 h-12 mr-4 border-b border-gray-300"
                      onSubmitEditing={() => saveNewName(recording.filePath)}
                      autoFocus={true}
                    />
                  ) : (
                    <Text className="text-gray-800 font-medium">
                      {recording.name.length > 20
                        ? recording.name.slice(0, 20) + '...'
                        : recording.name}
                    </Text>
                  )}
                  <Text className="text-gray-400 text-xs mt-1">
                    {new Intl.DateTimeFormat('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    }).format(new Date(recording.createdAt))}
                  </Text>
                </View>
                <View className="flex flex-row space-x-4">
                  {playingFile === recording.filePath ? (
                    isPaused ? (
                      <TouchableOpacity
                        onPress={resumePlaying}
                        disabled={isRecording}>
                        <Ionicons
                          name="play-circle"
                          size={32}
                          color="#3b82f6"
                        />
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        onPress={pausePlaying}
                        disabled={isRecording}>
                        <Ionicons
                          name="pause-circle"
                          size={32}
                          color="#3b82f6"
                        />
                      </TouchableOpacity>
                    )
                  ) : (
                    <TouchableOpacity
                      onPress={() => startPlaying(recording.filePath)}
                      disabled={isRecording}>
                      <Ionicons name="play-circle" size={32} color="#3b82f6" />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    onPress={() => {
                      setEditingFile(recording.filePath);
                      setNewName(recording.name);
                    }}
                    disabled={isRecording}>
                    <Ionicons name="create-outline" size={28} color="#10b981" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => deleteRecording(recording.filePath)}
                    disabled={isRecording}>
                    <Ionicons name="trash" size={28} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ),
          )
        ) : (
          <Text className="text-gray-500 text-center">
            No recordings found.
          </Text>
        )}
      </ScrollView>
    </View>
  );
};

export default RecordingList;
