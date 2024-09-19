import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { PlayerStats as PlayerStatsType } from '../types';
import tw from '../tailwind';

interface PlayerStatsProps {
  stats: PlayerStatsType;
  name: string;
}

const PlayerStats: React.FC<PlayerStatsProps> = ({ stats, name }) => {
  const averageLifeGained = stats.gamesPlayed > 0 ? stats.totalLifeGained / stats.gamesPlayed : 0;
  const averageLifeLost = stats.gamesPlayed > 0 ? stats.totalLifeLost / stats.gamesPlayed : 0;
  const averageCommanderDamageDealt = stats.gamesPlayed > 0 ? stats.totalCommanderDamageDealt / stats.gamesPlayed : 0;
  const averageCommanderDamageReceived = stats.gamesPlayed > 0 ? stats.totalCommanderDamageReceived / stats.gamesPlayed : 0;
  const averagePoisonCountersGiven = stats.gamesPlayed > 0 ? stats.totalPoisonCountersGiven / stats.gamesPlayed : 0;
  const averagePoisonCountersReceived = stats.gamesPlayed > 0 ? stats.totalPoisonCountersReceived / stats.gamesPlayed : 0;
  
  if (!stats) {
    return (
      <ScrollView style={tw`p-4`}>
        <Text style={tw`text-2xl font-bold mb-4`}>{name}'s Statistics</Text>
        <Text>No statistics available</Text>
      </ScrollView>
    );
  }
  return (
    <ScrollView style={tw`p-4`}>
      <Text style={tw`text-2xl font-bold mb-4`}>{name}'s Statistics</Text>
      <View style={tw`mb-4`}>
        <Text style={tw`text-lg font-semibold`}>Games Played: {stats.gamesPlayed}</Text>
        <Text style={tw`text-lg font-semibold`}>Wins: {stats.wins}</Text>
        <Text style={tw`text-lg`}>Win Rate: {((stats.wins / stats.gamesPlayed) * 100).toFixed(2)}%</Text>
      </View>
      <View style={tw`mb-4`}>
        <Text style={tw`text-lg font-semibold`}>Life</Text>
        <Text>Total Gained: {stats.totalLifeGained}</Text>
        <Text>Total Lost: {stats.totalLifeLost}</Text>
        <Text>Average Gained per Game: {averageLifeGained.toFixed(2)}</Text>
        <Text>Average Lost per Game: {averageLifeLost.toFixed(2)}</Text>
      </View>
      <View style={tw`mb-4`}>
        <Text style={tw`text-lg font-semibold`}>Commander Damage</Text>
        <Text>Total Dealt: {stats.totalCommanderDamageDealt}</Text>
        <Text>Total Received: {stats.totalCommanderDamageReceived}</Text>
        <Text>Average Dealt per Game: {averageCommanderDamageDealt.toFixed(2)}</Text>
        <Text>Average Received per Game: {averageCommanderDamageReceived.toFixed(2)}</Text>
      </View>
      <View style={tw`mb-4`}>
        <Text style={tw`text-lg font-semibold`}>Poison Counters</Text>
        <Text>Total Given: {stats.totalPoisonCountersGiven}</Text>
        <Text>Total Received: {stats.totalPoisonCountersReceived}</Text>
        <Text>Average Given per Game: {averagePoisonCountersGiven.toFixed(2)}</Text>
        <Text>Average Received per Game: {averagePoisonCountersReceived.toFixed(2)}</Text>
      </View>
    </ScrollView>
  );
};

export default PlayerStats;