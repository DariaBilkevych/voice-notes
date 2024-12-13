import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface Recording {
  filePath: string;
  name: string;
  createdAt: string;
}

interface AudioState {
  recordings: Recording[];
  currentlyPlayingFile: string | null;
  isRecording: boolean;
}

const initialState: AudioState = {
  recordings: [],
  currentlyPlayingFile: null,
  isRecording: false,
};

const audioSlice = createSlice({
  name: 'audio',
  initialState,
  reducers: {
    addRecording: (
      state,
      action: PayloadAction<{
        filePath: string;
        name: string;
        createdAt: string;
      }>,
    ) => {
      const newRecording = {
        filePath: action.payload.filePath,
        name: action.payload.name,
        createdAt: action.payload.createdAt,
      };
      state.recordings.push(newRecording);
    },

    removeRecording: (state, action: PayloadAction<string>) => {
      state.recordings = state.recordings.filter(
        recording => recording.filePath !== action.payload,
      );
    },

    updateRecordingName: (
      state,
      action: PayloadAction<{filePath: string; newName: string}>,
    ) => {
      const recording = state.recordings.find(
        recording => recording.filePath === action.payload.filePath,
      );
      if (recording) {
        recording.name = action.payload.newName;
      }
    },

    setCurrentlyPlaying: (state, action: PayloadAction<string | null>) => {
      state.currentlyPlayingFile = action.payload;
    },

    setIsRecording: (state, action: PayloadAction<boolean>) => {
      state.isRecording = action.payload;
    },
  },
});

export const {
  addRecording,
  removeRecording,
  updateRecordingName,
  setCurrentlyPlaying,
  setIsRecording,
} = audioSlice.actions;
export default audioSlice.reducer;
