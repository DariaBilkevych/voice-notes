import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface Recording {
  filePath: string;
  name: string;
}

interface AudioState {
  recordings: Recording[];
}

const initialState: AudioState = {
  recordings: [],
};

const audioSlice = createSlice({
  name: 'audio',
  initialState,
  reducers: {
    addRecording: (
      state,
      action: PayloadAction<{filePath: string; name: string}>,
    ) => {
      const newRecording = {
        filePath: action.payload.filePath,
        name: action.payload.name,
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
  },
});

export const {addRecording, removeRecording, updateRecordingName} =
  audioSlice.actions;
export default audioSlice.reducer;
