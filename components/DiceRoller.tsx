import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import tw from '../tailwind';

interface DiceRollerProps {
  onRollComplete: (diceType: number, result: number) => void;
}

const DiceRoller: React.FC<DiceRollerProps> = ({ onRollComplete }) => {
  const diceTypes = [4, 6, 8, 10, 20, 100];
  const [lastRoll, setLastRoll] = useState<{ type: number; result: number } | null>(null);

  const rollDice = (diceType: number) => {
    const result = Math.floor(Math.random() * diceType) + 1;
    setLastRoll({ type: diceType, result });
    onRollComplete(diceType, result);
  };

  return (
    <View style={tw`bg-gray-100 p-4 rounded-lg`}>
      <Text style={tw`text-xl font-bold mb-2 text-center`}>Dice Roller</Text>
      <View style={tw`flex-row flex-wrap justify-center mb-4`}>
        {diceTypes.map((diceType) => (
          <TouchableOpacity
            key={diceType}
            style={tw`bg-blue-500 p-2 rounded-lg m-1`}
            onPress={() => rollDice(diceType)}
          >
            <Text style={tw`text-white font-bold`}>D{diceType}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {lastRoll && (
        <View style={tw`bg-white p-3 rounded-lg`}>
          <Text style={tw`text-center text-lg`}>
            D{lastRoll.type} Result: <Text style={tw`font-bold text-2xl`}>{lastRoll.result}</Text>
          </Text>
        </View>
      )}
    </View>
  );
};

export default DiceRoller;
