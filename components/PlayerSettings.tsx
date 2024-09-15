import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, Image } from 'react-native';
import tw from '../tailwind';
import { Player } from '../types';
import IconSelector from './IconSelector';

interface PlayerSettingsProps {
  visible: boolean;
  player?: Player;
  onUpdate: (updatedPlayer: Player) => void;
  onClose: () => void;
}

const PlayerSettings: React.FC<PlayerSettingsProps> = ({ visible, player, onUpdate, onClose }) => {
  if (!player) return null;
  const [name, setName] = useState(player?.name || '');
  const [showIconSelector, setShowIconSelector] = useState(false);

  const handleSave = () => {
    onUpdate({ ...player, name });
    onClose();
  };

  const handleIconSelect = (icon: string) => {
    onUpdate({ ...player, icon });
    setShowIconSelector(false);
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
        <View style={tw`bg-white p-4 rounded-lg`}>
          <Text style={tw`text-lg font-bold mb-2`}>Player Settings</Text>
          <TextInput
            style={tw`border border-gray-300 rounded p-2 mb-2`}
            value={name}
            onChangeText={setName}
            placeholder="Enter player name"
          />
          <TouchableOpacity onPress={() => setShowIconSelector(true)} style={tw`mb-2`}>
            <Image source={{ uri: player.icon }} style={tw`w-16 h-16 rounded`} />
            <Text style={tw`text-blue-500`}>Change Icon</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSave} style={tw`bg-blue-500 p-2 rounded`}>
            <Text style={tw`text-white text-center`}>Save</Text>
          </TouchableOpacity>
          <IconSelector
            visible={showIconSelector}
            onSelect={handleIconSelect}
            onClose={() => setShowIconSelector(false)}
          />
        </View>
      </View>
    </Modal>
  );
};

export default PlayerSettings;
