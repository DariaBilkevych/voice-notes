export const validateEditingName = (
  name: string,
  existingNames: string[],
): string[] => {
  const errors: string[] = [];

  if (!name || !name.trim()) {
    errors.push('Name cannot be empty.');
  }

  if (name.trim().length > 30) {
    errors.push('Name cannot be more than 30 characters.');
  }

  if (
    existingNames.some(
      existingName => existingName.toLowerCase() === name.trim().toLowerCase(),
    )
  ) {
    errors.push('This name is already taken.');
  }

  return errors;
};
