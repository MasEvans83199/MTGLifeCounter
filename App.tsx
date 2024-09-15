import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import tw from './tailwind';
import { Player, Preset } from './types';
import PlayerComponent from './components/PlayerComponent';
import PlayerSettings from './components/PlayerSettings';
import GameHistory from './components/GameHistory';

export default function App() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [currentPreset, setCurrentPreset] = useState<Preset | null>(null);
  const [showSettings, setShowSettings] = useState<number | null>(null);
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [showSavePresetModal, setShowSavePresetModal] = useState(false);
  const [gameHistory, setGameHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);

  useEffect(() => {
    loadPresets();
  }, []);

  const loadPresets = async () => {
    try {
      const savedPresets = await AsyncStorage.getItem('presets');
      if (savedPresets) {
        setPresets(JSON.parse(savedPresets));
      }
    } catch (error) {
      console.error('Failed to load presets', error);
    }
  };

  const savePreset = async () => {
    if (presetName.trim() === '') return;
    
    const newPreset: Preset = {
      id: Date.now().toString(),
      name: presetName,
      players: players.map(p => ({ ...p, life: 40, commanderDamage: 0, poisonCounters: 0, isDead: false })),
    };
    const updatedPresets = [...presets, newPreset];
    setPresets(updatedPresets);
    try {
      await AsyncStorage.setItem('presets', JSON.stringify(updatedPresets));
      setPresetName('');
      setShowSavePresetModal(false);
    } catch (error) {
      console.error('Failed to save preset', error);
    }
  };

  const loadPreset = (preset: Preset) => {
    setPlayers(preset.players.map(p => ({ ...p, life: 40, commanderDamage: 0, poisonCounters: 0, isDead: false })));
    setCurrentPreset(preset);
    setShowPresetModal(false);
  };

  const formatTimestamp = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const logEvent = (event: string) => {
    setGameHistory(prevHistory => [...prevHistory, `[${new Date().toLocaleTimeString()}] ${event}`]);
  };
  
  const handleLifeChange = (playerId: number, amount: number) => {
    setPlayers(prevPlayers => prevPlayers.map(p => {
      if (p.id === playerId) {
        const newLife = Math.max(0, p.life + amount);
        const isDead = newLife <= 0;
        if (isDead) {
          logEvent(`${p.name} has been eliminated!`);
        }
        return { ...p, life: newLife, isDead };
      }
      return p;
    }));
  };
  
  const handleCommanderDamageChange = (playerId: number, amount: number) => {
    setPlayers(prevPlayers => prevPlayers.map(p => {
      if (p.id === playerId) {
        const newCommanderDamage = Math.max(0, p.commanderDamage + amount);
        const newLife = Math.max(0, p.life - amount);
        const isDead = newLife <= 0 || newCommanderDamage >= 21;
        if (isDead) {
          logEvent(`${p.name} has been eliminated by commander damage!`);
        }
        return { ...p, commanderDamage: newCommanderDamage, life: newLife, isDead };
      }
      return p;
    }));
  };
  
  const handlePoisonCountersChange = (playerId: number, amount: number) => {
    setPlayers(prevPlayers => prevPlayers.map(p => {
      if (p.id === playerId) {
        const newPoisonCounters = Math.max(0, p.poisonCounters + amount);
        const isDead = newPoisonCounters >= 10;
        if (isDead) {
          logEvent(`${p.name} has been eliminated by poison!`);
        }
        return { ...p, poisonCounters: newPoisonCounters, isDead };
      }
      return p;
    }));
  };
  
  const addPlayer = () => {
    if (players.length < 4) {
      const manaColors = ['white', 'blue', 'black', 'red', 'green'];
      const newPlayer: Player = {
        id: players.length + 1,
        name: `Player ${players.length + 1}`,
        life: 40,
        manaColor: manaColors[players.length % manaColors.length],
        commanderDamage: 0,
        poisonCounters: 0,
        isDead: false,
        icon: 'default_icon.png',
        wins: 0,
        hasCrown: false
      };
      setPlayers([...players, newPlayer]);
      logEvent(`${newPlayer.name} has joined the game.`);
    }
  };

  const removePlayer = (playerId: number) => {
    const player = players.find(p => p.id === playerId);
    if (player) {
      setPlayers(players.filter(p => p.id !== playerId));
      logEvent(`${player.name} has been removed from the game.`);
    }
  };

  const resetGame = () => {
    setPlayers(players.map(player => ({ 
      ...player, 
      life: 40, 
      commanderDamage: 0, 
      poisonCounters: 0, 
      isDead: false 
    })));
    setGameEnded(false);
    logEvent("Game has been reset. New game starting!");
  };
  
  const updatePlayer = (updatedPlayer: Player) => {
    setPlayers(players.map(p => p.id === updatedPlayer.id ? updatedPlayer : p));
    logEvent(`${updatedPlayer.name}'s information has been updated.`);
  };

  const handleGameEnd = (winnerId: number) => {
    if (gameEnded) return;
  
    console.log('Game ended, winner ID:', winnerId);
    const winner = players.find(p => p.id === winnerId);
    if (winner) {
      logEvent(`${winner.name} has won the game!`);
      setPlayers(prevPlayers => prevPlayers.map(p => ({
        ...p,
        hasCrown: p.id === winnerId,
        wins: p.id === winnerId ? p.wins + 1 : p.wins
      })));
  
      if (currentPreset) {
        const updatedPreset = {
          ...currentPreset,
          players: currentPreset.players.map(p => 
            p.id === winnerId ? { ...p, wins: p.wins + 1, hasCrown: true } : { ...p, hasCrown: false }
          ),
        };
        setCurrentPreset(updatedPreset);
        setPresets(prevPresets => prevPresets.map(p => p.id === updatedPreset.id ? updatedPreset : p));
        AsyncStorage.setItem('presets', JSON.stringify(presets)).catch(error =>
          console.error('Failed to save updated preset', error)
        );
      }
      setGameEnded(true);
    }
  };
  
  const checkGameEnd = () => {
    if (gameEnded) return;
  
    const alivePlayers = players.filter(p => !p.isDead);
    if (alivePlayers.length === 1) {
      const winner = alivePlayers[0];
      handleGameEnd(winner.id);
      setGameEnded(true);
    }
  };  
  
  useEffect(() => {
    if (gameEnded) return;
  
    console.log('Players state changed:', players);
    const alivePlayers = players.filter(p => !p.isDead);
    console.log('Alive players:', alivePlayers.length);
    
    if (alivePlayers.length === 1) {
      handleGameEnd(alivePlayers[0].id);
    }
  }, [players, gameEnded]);

  return (
    <View style={tw`flex-1 bg-gray-100 pt-12`}>
      <Text style={tw`text-3xl font-bold text-center mb-4`}>MTG Life Counter</Text>
      <ScrollView contentContainerStyle={tw`items-center`}>
        {players.map(player => (
          <PlayerComponent
            key={player.id}
            player={player}
            onLifeChange={(amount) => handleLifeChange(player.id, amount)}
            onCommanderDamageChange={(amount) => handleCommanderDamageChange(player.id, amount)}
            onPoisonCountersChange={(amount) => handlePoisonCountersChange(player.id, amount)}
            onSettingsPress={() => setShowSettings(player.id)}
            onRemove={() => removePlayer(player.id)}
          />
        ))}
      </ScrollView>
      <View style={tw`flex-row justify-center p-4 flex-wrap`}>
        <TouchableOpacity style={tw`bg-blue-500 p-2 rounded m-1`} onPress={addPlayer}>
          <Text style={tw`text-white font-bold`}>Add Player</Text>
        </TouchableOpacity>
        <TouchableOpacity style={tw`bg-red-500 p-2 rounded m-1`} onPress={resetGame}>
          <Text style={tw`text-white font-bold`}>Reset Game</Text>
        </TouchableOpacity>
        <TouchableOpacity style={tw`bg-green-500 p-2 rounded m-1`} onPress={() => setShowPresetModal(true)}>
          <Text style={tw`text-white font-bold`}>Presets</Text>
        </TouchableOpacity>
        <TouchableOpacity style={tw`bg-yellow-500 p-2 rounded m-1`} onPress={() => setShowHistory(true)}>
          <Text style={tw`text-white font-bold`}>Show History</Text>
        </TouchableOpacity>
      </View>

      <PlayerSettings
        visible={showSettings !== null}
        player={players.find(p => p.id === showSettings)!}
        onUpdate={updatePlayer}
        onClose={() => setShowSettings(null)}
      />

      <Modal visible={showPresetModal} animationType="slide" transparent={true}>
        <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
          <View style={tw`bg-white p-4 rounded-lg w-4/5`}>
            <Text style={tw`text-lg font-bold mb-2`}>Presets</Text>
            {presets.map(preset => (
              <TouchableOpacity
                key={preset.id}
                style={tw`bg-blue-100 p-2 rounded mb-2`}
                onPress={() => loadPreset(preset)}
              >
                <Text>{preset.name}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={tw`bg-green-500 p-2 rounded mt-2`}
              onPress={() => setShowSavePresetModal(true)}
            >
              <Text style={tw`text-white text-center`}>Save Current as Preset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={tw`bg-red-500 p-2 rounded mt-2`}
              onPress={() => setShowPresetModal(false)}
            >
              <Text style={tw`text-white text-center`}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showSavePresetModal} animationType="slide" transparent={true}>
        <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
          <View style={tw`bg-white p-4 rounded-lg w-4/5`}>
            <TextInput
              style={tw`border border-gray-300 rounded p-2 mb-4`}
              value={presetName}
              onChangeText={setPresetName}
              placeholder="Enter preset name"
            />
            <TouchableOpacity onPress={savePreset} style={tw`bg-blue-500 p-2 rounded mb-2`}>
              <Text style={tw`text-white text-center font-bold`}>Save Preset</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowSavePresetModal(false)} style={tw`bg-red-500 p-2 rounded`}>
              <Text style={tw`text-white text-center font-bold`}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <GameHistory 
        visible={showHistory} 
        history={gameHistory} 
        onClose={() => setShowHistory(false)} 
      />
    </View>
  );
}