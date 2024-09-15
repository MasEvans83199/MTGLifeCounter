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
  const [changeBuffer, setChangeBuffer] = useState<Record<number, Record<string, number>>>({});

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

  const logBufferedChanges = () => {
    Object.entries(changeBuffer).forEach(([playerId, changes]) => {
      const player = players.find(p => p.id === Number(playerId));
      if (player) {
        Object.entries(changes).forEach(([changeType, amount]) => {
          if (amount !== 0) {
            const action = amount > 0 ? 'gained' : 'lost';
            const absAmount = Math.abs(amount);
            switch (changeType) {
              case 'life':
                logEvent(`${player.name} ${action} ${absAmount} life. New total: ${player.life}`);
                break;
              case 'commanderDamage':
                logEvent(`${player.name} received ${absAmount} commander damage. Total: ${player.commanderDamage}`);
                break;
              case 'poisonCounters':
                logEvent(`${player.name} ${action} ${absAmount} poison counters. Total: ${player.poisonCounters}`);
                break;
            }
          }
        });
      }
    });
    setChangeBuffer({});
  };  
  
  const bufferChange = (playerId: number, changeType: string, amount: number) => {
    setChangeBuffer(prev => {
      const playerBuffer = prev[playerId] || {};
      return {
        ...prev,
        [playerId]: {
          ...playerBuffer,
          [changeType]: (playerBuffer[changeType] || 0) + amount
        }
      };
    });
  };
  
  const handleLifeChange = (playerId: number, amount: number) => {
    setPlayers(prevPlayers => prevPlayers.map(p => 
      p.id === playerId ? { ...p, life: Math.max(0, p.life + amount) } : p
    ));
    bufferChange(playerId, 'life', amount);
  };
  
  const handleCommanderDamageChange = (playerId: number, amount: number) => {
    const player = players.find(p => p.id === playerId);
    if (player) {
      const newCommanderDamage = Math.max(0, player.commanderDamage + amount);
      const newLife = Math.max(0, player.life - amount);
      const isDead = newLife <= 0 || newCommanderDamage >= 21;
      setPlayers(players.map(p => p.id === playerId ? { ...p, commanderDamage: newCommanderDamage, life: newLife, isDead } : p));
      if (amount !== 0) {
        logEvent(`${player.name} received ${amount} commander damage. Total: ${newCommanderDamage}`);
      }
      if (isDead) {
        logEvent(`${player.name} has been eliminated by commander damage!`);
      }
    }
  };
  
  const handlePoisonCountersChange = (playerId: number, amount: number) => {
    const player = players.find(p => p.id === playerId);
    if (player) {
      const newPoisonCounters = Math.max(0, player.poisonCounters + amount);
      const isDead = newPoisonCounters >= 10;
      setPlayers(players.map(p => p.id === playerId ? { ...p, poisonCounters: newPoisonCounters, isDead } : p));
      if (amount !== 0) {
        const action = amount > 0 ? 'gained' : 'lost';
        logEvent(`${player.name} ${action} ${Math.abs(amount)} poison counters. Total: ${newPoisonCounters}`);
      }
      if (isDead) {
        logEvent(`${player.name} has been eliminated by poison!`);
      }
    }
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

  useEffect(() => {
    const timer = setTimeout(() => {
      logBufferedChanges();
    }, 1000); // Adjust this delay as needed
  
    return () => clearTimeout(timer);
  }, [changeBuffer, players]);
  

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