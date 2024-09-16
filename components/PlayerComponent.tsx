import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import tw from '../tailwind';
import { Player } from '../types';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

interface PlayerComponentProps {
  player: Player;
  onLifeChange: (amount: number) => void;
  onCommanderDamageChange: (amount: number) => void;
  onPoisonCountersChange: (amount: number) => void;
  onSettingsPress: () => void;
  onRemove: () => void;
  disabled: boolean;
}

const PlayerComponent: React.FC<PlayerComponentProps> = ({ player, onLifeChange, onCommanderDamageChange, onPoisonCountersChange, onSettingsPress, onRemove, disabled }) => {
  const [lifeChangeBuffer, setLifeChangeBuffer] = useState(0);
  const [commanderDamageBuffer, setCommanderDamageBuffer] = useState(0);
  const [poisonCountersBuffer, setPoisonCountersBuffer] = useState(0);
  const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isLongPress, setIsLongPress] = useState(false);
  const [hasLongPressed, setHasLongPressed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (lifeChangeBuffer !== 0) {
        onLifeChange(lifeChangeBuffer);
        setLifeChangeBuffer(0);
      }
      if (commanderDamageBuffer !== 0) {
        onCommanderDamageChange(commanderDamageBuffer);
        setCommanderDamageBuffer(0);
      }
      if (poisonCountersBuffer !== 0) {
        onPoisonCountersChange(poisonCountersBuffer);
        setPoisonCountersBuffer(0);
      }
    }, 0);
  
    return () => clearTimeout(timer);
  }, [lifeChangeBuffer, commanderDamageBuffer, poisonCountersBuffer]);
  
  const handleLifeChange = (amount: number) => {
    setLifeChangeBuffer(prev => prev + amount);
  };

  const handleCommanderDamageChange = (amount: number) => {
    setCommanderDamageBuffer(prev => prev + amount);
  };

  const handlePoisonCountersChange = (amount: number) => {
    setPoisonCountersBuffer(prev => prev + amount);
  };

  const startLongPress = (amount: number) => {
    setIsLongPress(true);
    handleLifeChange(amount * 10);
    intervalRef.current = setInterval(() => {
      handleLifeChange(amount * 10);
    }, 200);
  };

  const handlePressIn = (amount: number) => {
    setHasLongPressed(false);
    longPressTimeoutRef.current = setTimeout(() => {
      setHasLongPressed(true);
      startLongPress(amount);
    }, 500);
  };
  
  const handlePressOut = () => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsLongPress(false);
  };
  
  const handlePress = (amount: number) => {
    if (!hasLongPressed) {
      handleLifeChange(amount);
    }
    setHasLongPressed(false);
  };
  
    return (
      <View style={tw`bg-mana-${player.manaColor} p-4 rounded-lg m-2 w-full max-w-xs ${player.isDead ? 'opacity-50' : ''}`}>
        <View style={tw`flex-row justify-between items-center mb-2`}>
          <View style={tw`flex-row items-center`}>
            <Image source={{ uri: player.icon }} style={tw`w-8 h-8 rounded-full mr-2`} />
            <Text style={tw`text-xl font-bold`}>{player.name}</Text>
            {player.hasCrown && (
              <FontAwesome5 name="crown" size={20} color="gold" style={tw`ml-2`} />
            )}
          </View>
          <View style={tw`flex-row`}>
            <Pressable onPress={onSettingsPress} style={tw`mr-2`}>
              <FontAwesome5 name="cog" size={24} color="gray" />
            </Pressable>
            <Pressable onPress={onRemove}>
              <FontAwesome5 name="trash" size={24} color="red" />
            </Pressable>
          </View>
        </View>
        
        {/* Life Counter */}
        <View style={tw`items-center my-4`}>
          <Text style={tw`text-5xl font-bold`}>{player.life}</Text>
        </View>
        <View style={tw`flex-row justify-between mb-4`}>
          <Pressable 
            style={tw`bg-red-500 p-3 rounded-full`} 
            onPressIn={() => handlePressIn(-1)}
            onPressOut={handlePressOut}
            onPress={() => handlePress(-1)}
            disabled={disabled || player.isDead}
          >
            <Text style={tw`text-white font-bold text-xl`}>-</Text>
          </Pressable>
          <Pressable 
            style={tw`bg-green-500 p-3 rounded-full`} 
            onPressIn={() => handlePressIn(1)}
            onPressOut={handlePressOut}
            onPress={() => handlePress(1)}
            disabled={disabled || player.isDead}
          >
            <Text style={tw`text-white font-bold text-xl`}>+</Text>
          </Pressable>
        </View>

        <View style={tw`flex-row justify-between items-center mb-2`}>
          <Text style={tw`text-sm`}>Commander Damage:</Text>
          <View style={tw`flex-row`}>
            <Pressable 
              style={tw`bg-gray-500 p-1 rounded mr-1`} 
              onPress={() => handleCommanderDamageChange(-1)}
              disabled={disabled || player.isDead}
            >
              <Text style={tw`text-white font-bold`}>-</Text>
            </Pressable>
            <Text style={tw`text-lg font-bold mx-2`}>{player.commanderDamage}</Text>
            <Pressable 
              style={tw`bg-gray-500 p-1 rounded ml-1`} 
              onPress={() => handleCommanderDamageChange(1)}
              disabled={disabled || player.isDead}
            >
              <Text style={tw`text-white font-bold`}>+</Text>
            </Pressable>
          </View>
        </View>

        <View style={tw`flex-row justify-between items-center`}>
          <Text style={tw`text-sm`}>Poison Counters:</Text>
          <View style={tw`flex-row`}>
            <Pressable 
              style={tw`bg-purple-500 p-1 rounded mr-1`} 
              onPress={() => handlePoisonCountersChange(-1)}
              disabled={disabled || player.isDead}
            >
              <Text style={tw`text-white font-bold`}>-</Text>
            </Pressable>
            <Text style={tw`text-lg font-bold mx-2`}>{player.poisonCounters}</Text>
            <Pressable 
              style={tw`bg-purple-500 p-1 rounded ml-1`} 
              onPress={() => handlePoisonCountersChange(1)}
              disabled={disabled || player.isDead}
            >
              <Text style={tw`text-white font-bold`}>+</Text>
            </Pressable>
          </View>
        </View>
        
        {player.isDead && (
          <View style={tw`absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg`}>
            <Text style={tw`text-white text-2xl font-bold`}>DEAD</Text>
          </View>
        )}
      </View>
    );
  };
  
  export default PlayerComponent;  