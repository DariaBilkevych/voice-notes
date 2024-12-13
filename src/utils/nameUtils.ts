export const generateInitialName = (recordings: {name: string}[]): string => {
  let nextRecordingNumber = 1;
  const existingNames = recordings.map(recording => recording.name);

  while (existingNames.includes(`New Recording ${nextRecordingNumber}`)) {
    nextRecordingNumber++;
  }

  return `New Recording ${nextRecordingNumber}`;
};
