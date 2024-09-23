import React from 'react';
import { View, Text } from 'react-native';
import tw from '../tailwind';
import { Player } from '../types';

interface PlayerCardProps {
  player: Player;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player }) => (
  <View style={tw`bg-white p-4 rounded-lg shadow-md`}>
    <Text style={tw`text-lg font-bold`}>{player.name}</Text>
    <Text>Life: {player.life}</Text>
    <Text>Commander Damage: {player.commanderDamage}</Text>
    <Text>Poison Counters: {player.poisonCounters}</Text>
  </View>
);

export default PlayerCard;
