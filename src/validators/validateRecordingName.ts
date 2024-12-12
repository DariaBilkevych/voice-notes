export const validateRecordingName = (
  name: string,
  existingNames: string[],
) => {
  const errors = [];

  if (!name || !name.trim()) {
    errors.push('Name cannot be empty.');
  }

  if (name.trim().length > 30) {
    errors.push('Name cannot be more than 30 characters.');
  }

  if (existingNames.includes(name.trim())) {
    errors.push('This name is already taken.');
  }

  return errors;
};
