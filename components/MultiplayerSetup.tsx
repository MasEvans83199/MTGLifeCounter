import React, { useState } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import tw from '../tailwind';

interface MultiplayerSetupProps {
  onCreateGame: () => void;
  onJoinGame: (gameId: string) => void;
  onBack: () => void;
}

const MultiplayerSetup: React.FC<MultiplayerSetupProps> = ({ onCreateGame, onJoinGame, onBack }) => {
  const [gameId, setGameId] = useState('');

  return (
    <View style={tw`flex-1 justify-center items-center bg-gray-100`}>
      <Text style={tw`text-2xl font-bold mb-8`}>Multiplayer Setup</Text>
      <Pressable 
        style={tw`bg-blue-500 p-4 rounded-lg mb-4 w-64`}
        onPress={onCreateGame}
      >
        <Text style={tw`text-white text-center font-bold`}>Create Game</Text>
      </Pressable>
      <Text style={tw`text-lg mb-2`}>Or</Text>
      <TextInput
        style={tw`border border-gray-300 rounded p-2 mb-4 w-64`}
        value={gameId}
        onChangeText={setGameId}
        placeholder="Enter Game ID"
      />
      <Pressable 
        style={tw`bg-green-500 p-4 rounded-lg mb-4 w-64`}
        onPress={() => onJoinGame(gameId)}
      >
        <Text style={tw`text-white text-center font-bold`}>Join Game</Text>
      </Pressable>
      <Pressable 
        style={tw`bg-gray-500 p-4 rounded-lg w-64`}
        onPress={onBack}
      >
        <Text style={tw`text-white text-center font-bold`}>Back</Text>
      </Pressable>
    </View>
  );
};

export default MultiplayerSetup;
