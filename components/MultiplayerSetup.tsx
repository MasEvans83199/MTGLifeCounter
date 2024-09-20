import React, { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { createGame, joinGame } from '../src/utils/firebase';
import tw from '../tailwind';

interface MultiplayerSetupProps {
  onGameStart: (gameId: string, isHost: boolean) => void;
}

const MultiplayerSetup: React.FC<MultiplayerSetupProps> = ({ onGameStart }) => {
  const [gameId, setGameId] = useState('');

  const handleCreateGame = async () => {
    const newGameId = await createGame(Date.now().toString());
    if (newGameId !== null) {
      onGameStart(newGameId, true);
    } else {
      console.error('Failed to create game');
    }
  };  

  const handleJoinGame = async () => {
    if (gameId) {
      const joined = await joinGame(gameId, Date.now().toString());
      if (joined) {
        onGameStart(gameId, false);
      } else {
        alert('Game not found');
      }
    }
  };

  return (
    <View style={tw`p-4`}>
      <Pressable style={tw`bg-blue-500 p-2 rounded mb-4`} onPress={handleCreateGame}>
        <Text style={tw`text-white text-center`}>Create Game</Text>
      </Pressable>
      <TextInput
        style={tw`border border-gray-300 rounded p-2 mb-4`}
        value={gameId}
        onChangeText={setGameId}
        placeholder="Enter Game ID"
      />
      <Pressable style={tw`bg-green-500 p-2 rounded`} onPress={handleJoinGame}>
        <Text style={tw`text-white text-center`}>Join Game</Text>
      </Pressable>
    </View>
  );
};

export default MultiplayerSetup;
