import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from '../tailwind';

import * as Clipboard from 'expo-clipboard';

const RoomCodeDisplay: React.FC<{ roomCode: string }> = ({ roomCode }) => {
  const copyToClipboard = () => {
    Clipboard.setString(roomCode);
    // Optionally, you can show a toast or alert to indicate the code was copied
  };

  return (
    <Pressable 
      onPress={copyToClipboard}
      style={tw`absolute top-4 left-4 bg-gray-800 p-2 rounded`}
    >
      <Text style={tw`text-white font-bold`}>Room Code: {roomCode}</Text>
      <Text style={tw`text-white text-xs`}>(Tap to copy)</Text>
    </Pressable>
  );
};

  export default RoomCodeDisplay;