import React, {useState, useEffect} from 'react';
import {Modal, View, Text, TextInput, TouchableOpacity} from 'react-native';
import {useSelector} from 'react-redux';
import {generateInitialName} from '../../utils/nameUtils';
import {validateRecordingName} from '../../validators/validateRecordingName';

const SaveRecordingModal = ({
  visible,
  onSave,
  onCancel,
}: {
  visible: boolean;
  onSave: (name: string) => void;
  onCancel: () => void;
}) => {
  const recordings = useSelector((state: any) => state.audio.recordings);

  const [name, setName] = useState(generateInitialName(recordings));
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (visible) {
      setName(generateInitialName(recordings));
      setErrors([]);
    }
  }, [visible, recordings]);

  const handleSave = () => {
    const validationErrors = validateRecordingName(
      name,
      recordings.map((recording: {name: string}) => recording.name),
    );

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSave(name.trim());
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 justify-center items-center bg-black/75">
        <View className="w-4/5 bg-white p-5 rounded-lg">
          <Text className="text-lg font-bold mb-3">Save Recording</Text>
          <TextInput
            value={name}
            onChangeText={text => {
              setName(text);
              setErrors([]);
            }}
            placeholder="Enter recording name"
            className="border border-gray-300 rounded-lg px-3 py-2 mb-4"
          />
          {errors.length > 0 &&
            errors.map((error, index) => (
              <Text key={index} className="text-red-500 text-sm mb-2">
                {error}
              </Text>
            ))}
          <View className="flex-row justify-end">
            <TouchableOpacity onPress={onCancel} className="mr-3">
              <Text className="text-red-500">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave}>
              <Text className="text-green-500">Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default SaveRecordingModal;
