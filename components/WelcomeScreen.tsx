import React from 'react';
import { View, Text, Pressable } from 'react-native';
import tw from '../tailwind';

interface WelcomeScreenProps {
  onStartLocalGame: () => void;
  onHostSession: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStartLocalGame, onHostSession }) => {
  return (
    <View style={tw`flex-1 justify-center items-center bg-gray-100`}>
      <Text style={tw`text-4xl font-bold mb-8`}>MTG Life Counter</Text>
      <Pressable 
        style={tw`bg-blue-500 p-4 rounded-lg mb-4 w-64`}
        onPress={onStartLocalGame}
      >
        <Text style={tw`text-white text-center font-bold`}>Start Local Game</Text>
      </Pressable>
      <Pressable 
        style={tw`bg-green-500 p-4 rounded-lg w-64`}
        onPress={onHostSession}
      >
        <Text style={tw`text-white text-center font-bold`}>Host/Join Online Session</Text>
      </Pressable>
    </View>
  );
};

export default WelcomeScreen;
