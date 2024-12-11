export const validateRecordingName = (
  name: string,
  existingNames: string[],
) => {
  const errors = [];

  if (!name || !name.trim()) {
    errors.push('Name cannot be empty.');
  }

  if (existingNames.includes(name.trim())) {
    errors.push('This name is already taken.');
  }

  return errors;
};
