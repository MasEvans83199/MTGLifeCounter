import React, { useEffect } from 'react';
import { View, Text, Animated } from 'react-native';
import tw from '../tailwind';

interface PlayerJoinNotificationProps {
  playerName: string;
  onDismiss: () => void;
}

const PlayerJoinNotification: React.FC<PlayerJoinNotificationProps> = ({ playerName, onDismiss }) => {
  const opacity = new Animated.Value(0);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.delay(2000),
      Animated.timing(opacity, { toValue: 0, duration: 500, useNativeDriver: true })
    ]).start(() => onDismiss());
  }, []);

  return (
    <Animated.View style={[tw`bg-green-500 p-2 rounded absolute top-4 left-4 right-4`, { opacity }]}>
      <Text style={tw`text-white text-center`}>{playerName} has joined the game!</Text>
    </Animated.View>
  );
};

export default PlayerJoinNotification;
