import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import tw from '../tailwind';
import { Player } from '../types';
import PlayerComponent from './PlayerComponent';

interface OpponentsViewProps {
  opponents: Player[];
  onOpponentPress: (opponent: Player) => void;
}

const OpponentsView: React.FC<OpponentsViewProps> = ({ opponents, onOpponentPress }) => {
  return (
    <View style={tw`mt-4`}>
      <Text style={tw`text-lg font-bold mb-2`}>Opponents</Text>
      <ScrollView horizontal={true}>
        {opponents.map(opponent => (
          <Pressable key={opponent.id.toString()} onPress={() => onOpponentPress(opponent)} style={tw`mr-2`}>
            <PlayerComponent
              player={opponent}
              isSmall={true}
              disabled={true}
            />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

export default OpponentsView;