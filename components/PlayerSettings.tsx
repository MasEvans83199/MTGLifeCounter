import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, Modal, Image } from 'react-native';
import tw from '../tailwind';
import { Player } from '../types';
import CardArtSelector from './CardArtSelector';

interface PlayerSettingsProps {
  visible: boolean;
  player: Player | null;
  onUpdate: (player: Player) => void;
  onClose: () => void;
}

const PlayerSettings: React.FC<PlayerSettingsProps> = ({ visible, player, onUpdate, onClose }) => {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [showCardArtSelector, setShowCardArtSelector] = useState(false);

  useEffect(() => {
    if (player) {
      setName(player.name);
      setIcon(player.icon);
    }
  }, [player]);

  const handleUpdate = () => {
    if (player) {
      onUpdate({ ...player, name, icon });
    }
    onClose();
  };

  const handleSelectArt = (artUrl: string | null) => {
    if (artUrl) {
      setIcon(artUrl);
    }
    setShowCardArtSelector(false);
  };

  if (!player) {
    return null;
  }

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
        <View style={tw`bg-white p-4 rounded-lg w-4/5`}>
          <Text style={tw`text-lg font-bold mb-2`}>Player Settings</Text>
          <TextInput
            style={tw`border border-gray-300 rounded p-2 mb-4`}
            value={name}
            onChangeText={setName}
            placeholder="Enter player name"
          />
          <Pressable
            style={tw`bg-blue-500 p-2 rounded mb-2`}
            onPress={() => setShowCardArtSelector(true)}
          >
            <Text style={tw`text-white text-center`}>Change Card Art</Text>
          </Pressable>
          {icon && (
            <Image
              source={{ uri: icon }}
              style={tw`w-20 h-20 rounded self-center mb-2`}
            />
          )}
          <Pressable
            style={tw`bg-green-500 p-2 rounded mb-2`}
            onPress={handleUpdate}
          >
            <Text style={tw`text-white text-center`}>Update</Text>
          </Pressable>
          <Pressable
            style={tw`bg-red-500 p-2 rounded`}
            onPress={onClose}
          >
            <Text style={tw`text-white text-center`}>Cancel</Text>
          </Pressable>
        </View>
      </View>
      <Modal visible={showCardArtSelector} animationType="slide">
        <CardArtSelector onSelectArt={handleSelectArt} />
        <Pressable
          style={tw`bg-red-500 p-2 m-4 rounded`}
          onPress={() => setShowCardArtSelector(false)}
        >
          <Text style={tw`text-white text-center`}>Close</Text>
        </Pressable>
      </Modal>
    </Modal>
  );
};

export default PlayerSettings;
