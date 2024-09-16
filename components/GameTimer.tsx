import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import tw from '../tailwind';

interface GameTimerProps {
  onTimeUp: () => void;
  duration: number;
  isActive: boolean;
  onDurationChange: (duration: number) => void;
  onActiveChange: (isActive: boolean) => void;
}

const GameTimer: React.FC<GameTimerProps> = ({ 
  onTimeUp, 
  duration, 
  isActive, 
  onDurationChange, 
  onActiveChange 
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
  
    if (isActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            if (timer) clearInterval(timer);
            onActiveChange(false);
            onTimeUp();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (!isActive && timer) {
      clearInterval(timer);
    }
  
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isActive, timeLeft, onActiveChange, onTimeUp]);  

  const startTimer = () => {
    if (timeLeft === 0) {
      setTimeLeft(duration);
    }
    onActiveChange(true);
  };

  const stopTimer = () => {
    onActiveChange(false);
  };

  const resetTimer = () => {
    onActiveChange(false);
    setTimeLeft(duration);
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
      <TouchableOpacity
        style={tw`bg-green-500 p-2 rounded-lg mb-2`}
        onPress={startTimer}
      >
        <Text style={tw`text-white font-bold text-center`}>Start Timer</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={tw`bg-red-500 p-2 rounded-lg mb-2`}
        onPress={stopTimer}
      >
        <Text style={tw`text-white font-bold text-center`}>Stop Timer</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={tw`bg-yellow-500 p-2 rounded-lg`}
        onPress={resetTimer}
      >
        <Text style={tw`text-white font-bold text-center`}>Reset Timer</Text>
      </TouchableOpacity>
    </View>
  );
};

export default GameTimer;
