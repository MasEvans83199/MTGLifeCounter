import React from 'react';
import { View, Text, FlatList } from 'react-native';
import tw from '../tailwind';
import { Player } from '../types';

interface PlayerLobbyProps {
  players: Player[];
  isHost: boolean;
}

const PlayerLobby: React.FC<PlayerLobbyProps> = ({ players, isHost }) => {
  return (
    <View style={tw`bg-gray-200 p-4 rounded-lg`}>
      <Text style={tw`text-lg font-bold mb-2`}>Players in Lobby</Text>
      <FlatList
        data={players}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={tw`flex-row justify-between items-center mb-2`}>
            <Text>{item.name}</Text>
            {item.isHost && <Text style={tw`text-sm text-gray-500`}>(Host)</Text>}
          </View>
        )}
      />
    </View>
  );
};

export default PlayerLobby;
