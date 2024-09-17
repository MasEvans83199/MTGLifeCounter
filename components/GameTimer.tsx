import React, { useState, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import tw from '../tailwind';

interface GameTimerProps {
  onTimeUp: () => void;
  duration: number;
  timeLeft: number;
  isActive: boolean;
  onDurationChange: (duration: number) => void;
  onActiveChange: (isActive: boolean) => void;
}

const GameTimer: React.FC<GameTimerProps> = ({ 
  onTimeUp, 
  duration, 
  timeLeft,
  isActive, 
  onDurationChange, 
  onActiveChange 
}) => {
  const startTimer = () => {
    if (timeLeft === 0) {
      onDurationChange(duration);
    }
    onActiveChange(true);
  };

  const stopTimer = () => {
    onActiveChange(false);
  };

  const resetTimer = () => {
    onActiveChange(false);
    onDurationChange(duration);
  };

  const setTimerDuration = (minutes: number) => {
    const newDuration = minutes * 60;
    onDurationChange(newDuration);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={tw`bg-gray-100 p-4 rounded-lg`}>
      <Text style={tw`text-xl font-bold text-center mb-2`}>Game Timer</Text>
      <Text style={tw`text-3xl font-bold text-center mb-4`}>
        {formatTime(timeLeft)}
      </Text>
      <View style={tw`flex-row justify-around mb-4`}>
        <Pressable onPress={() => setTimerDuration(5)} style={tw`bg-blue-500 p-2 rounded`}>
          <Text style={tw`text-white`}>5 min</Text>
        </Pressable>
        <Pressable onPress={() => setTimerDuration(10)} style={tw`bg-blue-500 p-2 rounded`}>
          <Text style={tw`text-white`}>10 min</Text>
        </Pressable>
        <Pressable onPress={() => setTimerDuration(15)} style={tw`bg-blue-500 p-2 rounded`}>
          <Text style={tw`text-white`}>15 min</Text>
        </Pressable>
      </View>
      <Pressable
        style={tw`bg-green-500 p-2 rounded-lg mb-2`}
        onPress={startTimer}
      >
        <Text style={tw`text-white font-bold text-center`}>Start Timer</Text>
      </Pressable>
      <Pressable
        style={tw`bg-red-500 p-2 rounded-lg mb-2`}
        onPress={stopTimer}
      >
        <Text style={tw`text-white font-bold text-center`}>Stop Timer</Text>
      </Pressable>
      <Pressable
        style={tw`bg-yellow-500 p-2 rounded-lg`}
        onPress={resetTimer}
      >
        <Text style={tw`text-white font-bold text-center`}>Reset Timer</Text>
      </Pressable>
    </View>
  );
};

export default GameTimer;
