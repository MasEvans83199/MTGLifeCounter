import React, { useState, useEffect, useCallback } from 'react';
import * as Font from 'expo-font';
import { View, Text, Pressable, Animated, Modal, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import tw from './tailwind';
import { Player, Preset } from './types';
import PlayerComponent from './components/PlayerComponent';
import PlayerSettings from './components/PlayerSettings';
import GameHistory from './components/GameHistory';
import GameTimer from './components/GameTimer';
import DiceRoller from './components/DiceRoller';
import CardArtSelector from './components/CardArtSelector';
import CardSearch from './components/CardSearch';
import PlayerStats from './components/PlayerStats';

const loadFonts = async () => {
  await Font.loadAsync({
    'dicefont': require('./assets/dice/dicefont.ttf'),
  });
};

function MainContent(){
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
  const [showGameTimer, setShowGameTimer] = useState(false);
  const [timerDuration, setTimerDuration] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showMiniTimer, setShowMiniTimer] = useState(false);
  const [miniTimerOpacity] = useState(new Animated.Value(1));
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [showDiceRoller, setShowDiceRoller] = useState(false);
  const [showCardSearch, setShowCardSearch] = useState(false);
  const [showStats, setShowStats] = useState(false);

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
      players: players.map(p => ({ 
        ...p, 
        life: 40, 
        commanderDamage: 0, 
        poisonCounters: 0, 
        isDead: false,
        stats: p.stats || getDefaultStats()
      })),
      gameState: null 
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
  
  const editPreset = (presetId: string) => {
    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      setPresetName(preset.name);
      setCurrentPreset(preset);
      setShowSavePresetModal(true);
    }
  };
  
  const deletePreset = async (presetId: string) => {
    const updatedPresets = presets.filter(p => p.id !== presetId);
    setPresets(updatedPresets);
    try {
      await AsyncStorage.setItem('presets', JSON.stringify(updatedPresets));
    } catch (error) {
      console.error('Failed to delete preset', error);
    }
  };  

  const loadPreset = (preset: Preset) => {
    if (preset.gameState) {
      setPlayers(preset.gameState.players);
      setGameHistory(preset.gameState.gameHistory);
      setGameEnded(preset.gameState.gameEnded);
    } else {
      setPlayers(preset.players.map(p => ({ 
        ...p, 
        life: 40, 
        commanderDamage: 0, 
        poisonCounters: 0, 
        isDead: false,
        stats: p.stats || getDefaultStats()
      })));
      setGameHistory([]);
      setGameEnded(false);
    }
    setCurrentPreset(preset);
    setShowPresetModal(false);
  };
  
  const getDefaultStats = () => ({
    gamesPlayed: 0,
    wins: 0,
    totalLifeGained: 0,
    totalLifeLost: 0,
    totalCommanderDamageDealt: 0,
    totalCommanderDamageReceived: 0,
    totalPoisonCountersGiven: 0,
    totalPoisonCountersReceived: 0,
  });  

  const saveCurrentGameState = async () => {
    if (currentPreset) {
      const updatedPreset = {
        ...currentPreset,
        players: players,
        gameState: {
          players,
          gameHistory,
          gameEnded
        }
      };
      const updatedPresets = presets.map(p => p.id === updatedPreset.id ? updatedPreset : p);
      setPresets(updatedPresets);
      setCurrentPreset(updatedPreset);
      try {
        await AsyncStorage.setItem('presets', JSON.stringify(updatedPresets));
        logEvent("Current game state saved.");
      } catch (error) {
        console.error('Failed to save current game state', error);
      }
    } else {
      const newPreset: Preset = {
        id: Date.now().toString(),
        name: `Game ${Date.now()}`,
        players: players,
        gameState: {
          players,
          gameHistory,
          gameEnded
        }
      };
      const updatedPresets = [...presets, newPreset];
      setPresets(updatedPresets);
      setCurrentPreset(newPreset);
      try {
        await AsyncStorage.setItem('presets', JSON.stringify(updatedPresets));
        logEvent("New preset created with current game state.");
      } catch (error) {
        console.error('Failed to save new preset', error);
      }
    }
  };
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
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
    setPlayers(prevPlayers => prevPlayers.map(p => {
      if (p.id === playerId) {
        const newLife = Math.max(0, p.life + amount);
        const isDead = newLife <= 0;
        if (isDead && !p.isDead) {
          logEvent(`${p.name} has been eliminated due to loss of life!`);
        }
        return { ...p, life: newLife, isDead };
      }
      return p;
    }));
    bufferChange(playerId, 'life', amount);
    checkGameEnd();
  };
  
  const handleCommanderDamageChange = (playerId: number, amount: number) => {
    setPlayers(prevPlayers => prevPlayers.map(p => {
      if (p.id === playerId) {
        const newCommanderDamage = Math.max(0, p.commanderDamage + amount);
        const newLife = Math.max(0, p.life - amount);
        const isDead = newLife <= 0 || newCommanderDamage >= 21;
        if (isDead && !p.isDead) {
          logEvent(`${p.name} has been eliminated by commander damage!`);
        }
        return { ...p, commanderDamage: newCommanderDamage, life: newLife, isDead };
      }
      return p;
    }));
    bufferChange(playerId, 'commanderDamage', amount);
    checkGameEnd();
  };
  
  const handlePoisonCountersChange = (playerId: number, amount: number) => {
    setPlayers(prevPlayers => prevPlayers.map(p => {
      if (p.id === playerId) {
        const newPoisonCounters = Math.max(0, p.poisonCounters + amount);
        const isDead = newPoisonCounters >= 10;
        if (isDead && !p.isDead) {
          logEvent(`${p.name} has been eliminated by poison!`);
        }
        return { ...p, poisonCounters: newPoisonCounters, isDead };
      }
      return p;
    }));
    bufferChange(playerId, 'poisonCounters', amount);
    checkGameEnd();
  };
  
  const getPlayerContainerStyle = (totalPlayers: number, index: number) => {
    if (totalPlayers === 1) return 'w-full aspect-[3/4]';
    if (totalPlayers === 2) return 'w-1/2 aspect-[3/4]';
    if (totalPlayers === 3) return index === 2 ? 'w-full aspect-[3/4]' : 'w-1/2 aspect-[3/4]';
    return 'w-1/2 aspect-[3/4]';
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
        icon: 'https://gatherer.wizards.com/Handlers/Image.ashx?type=card&multiverseid=0',
        hasCrown: false,
        stats: getDefaultStats()
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

  const handleTimeUp = () => {
    logEvent("Time's up!");
    blinkMiniTimer();
    if (timerInterval) clearInterval(timerInterval);
    setIsTimerActive(false);
  };  

  const blinkMiniTimer = () => {
    Animated.sequence([
      Animated.timing(miniTimerOpacity, { toValue: 0, duration: 500, useNativeDriver: true }),
      Animated.timing(miniTimerOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(miniTimerOpacity, { toValue: 0, duration: 500, useNativeDriver: true }),
      Animated.timing(miniTimerOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start(() => setShowMiniTimer(false));
  };

  const runTimer = () => {
    if (timerInterval) clearInterval(timerInterval);
    
    const interval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(interval);
          setIsTimerActive(false);
          handleTimeUp();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  
    setTimerInterval(interval);
  }; 
  
  const handleDiceRoll = (result: number) => {
    logEvent(`Dice roll result: ${result}`);
  };

  const resetGame = async () => {
    const resetPlayers = players.map(player => ({ 
      ...player, 
      life: 40, 
      commanderDamage: 0, 
      poisonCounters: 0, 
      isDead: false 
    }));
    setPlayers(resetPlayers);
    setGameEnded(false);
    setGameHistory([]);
    logEvent("Game has been reset. New game starting!");
  
    if (currentPreset) {
      const updatedPreset = {
        ...currentPreset,
        players: resetPlayers,
        gameState: null
      };
      const updatedPresets = presets.map(p => p.id === updatedPreset.id ? updatedPreset : p);
      setPresets(updatedPresets);
      setCurrentPreset(updatedPreset);
      try {
        await AsyncStorage.setItem('presets', JSON.stringify(updatedPresets));
      } catch (error) {
        console.error('Failed to save reset game state', error);
      }
    }
  };
  
  const updatePlayer = (updatedPlayer: Player) => {
    setPlayers(players.map(p => p.id === updatedPlayer.id ? updatedPlayer : p));
    logEvent(`${updatedPlayer.name}'s information has been updated.`);
  };

  const handleGameEnd = useCallback(async (winnerId: number) => {
    if (gameEnded) return;
    
    const winner = players.find(p => p.id === winnerId);
    if (winner) {
      console.log('Handling game end. Winner:', winner.name);
      logEvent(`${winner.name} has won the game!`);
      
      setPlayers(prevPlayers => prevPlayers.map(p => {
        const playerStats = p.stats || getDefaultStats();
        return {
          ...p,
          hasCrown: p.id === winnerId,
          isDead: p.id !== winnerId,
          stats: {
            ...playerStats,
            gamesPlayed: playerStats.gamesPlayed + 1,
            wins: p.id === winnerId ? playerStats.wins + 1 : playerStats.wins,
            totalLifeGained: playerStats.totalLifeGained + (p.life > 40 ? p.life - 40 : 0),
            totalLifeLost: playerStats.totalLifeLost + (p.life < 40 ? 40 - p.life : 0),
            totalCommanderDamageDealt: playerStats.totalCommanderDamageDealt + p.commanderDamage,
            totalCommanderDamageReceived: playerStats.totalCommanderDamageReceived + (p.life <= 0 && p.commanderDamage >= 21 ? 21 : 0),
            totalPoisonCountersGiven: playerStats.totalPoisonCountersGiven + p.poisonCounters,
            totalPoisonCountersReceived: playerStats.totalPoisonCountersReceived + (p.life <= 0 && p.poisonCounters >= 10 ? 10 : 0),
          }
        };
      }));
  
      if (currentPreset) {
        const updatedPreset = {
          ...currentPreset,
          players: players.map(p => ({
            ...p,
            hasCrown: p.id === winnerId,
            isDead: p.id !== winnerId,
            stats: p.stats || getDefaultStats()
          })),
          gameState: null
        };
        const updatedPresets = presets.map(p => p.id === updatedPreset.id ? updatedPreset : p);
        setPresets(updatedPresets);
        setCurrentPreset(updatedPreset);
        try {
          await AsyncStorage.setItem('presets', JSON.stringify(updatedPresets));
        } catch (error) {
          console.error('Failed to save updated preset', error);
        }
      }
      setGameEnded(true);
    }
  }, [players, gameEnded, currentPreset, presets, logEvent, getDefaultStats]);
  
  const updatePlayersAndCheckEnd = useCallback(() => {
    setPlayers(prevPlayers => {
      const alivePlayers = prevPlayers.filter(p => !p.isDead);-
      console.log('Checking game end. Alive players:', alivePlayers.length);
      if (prevPlayers.length > 1 && alivePlayers.length === 1 && !gameEnded) {
        console.log('Game should end. Winner:', alivePlayers[0].name);
        handleGameEnd(alivePlayers[0].id);
      }
      return prevPlayers;
    });
  }, [gameEnded, handleGameEnd]);
  
  useEffect(() => {
    const saveGameState = async () => {
      try {
        await AsyncStorage.setItem('gameState', JSON.stringify({
          players,
          gameHistory,
          gameEnded
        }));
      } catch (error) {
        console.error('Failed to save game state', error);
      }
    };
  
    saveGameState();
  }, [players, gameHistory, gameEnded]);
  
  useEffect(() => {
    const loadGameState = async () => {
      try {
        const savedState = await AsyncStorage.getItem('gameState');
        if (savedState) {
          const { players: savedPlayers, gameHistory: savedHistory, gameEnded: savedGameEnded } = JSON.parse(savedState);
          const playersWithStats = savedPlayers.map((player: Partial<Player>) => ({
            ...player,
            stats: player.stats || {
              gamesPlayed: 0,
              wins: 0,
              totalLifeGained: 0,
              totalLifeLost: 0,
              totalCommanderDamageDealt: 0,
              totalCommanderDamageReceived: 0,
              totalPoisonCountersGiven: 0,
              totalPoisonCountersReceived: 0
            }
          }));
          setPlayers(playersWithStats as Player[]);
          setGameHistory(savedHistory);
          setGameEnded(savedGameEnded);
        }
      } catch (error) {
        console.error('Failed to load game state', error);
      }
    };    
  
    loadGameState();
  }, []);    
  
  const checkGameEnd = useCallback(() => {
    if (gameEnded) return;
  
    const alivePlayers = players.filter(p => !p.isDead);
    console.log('Checking game end. Alive players:', alivePlayers.length);
    
    if (players.length > 1 && alivePlayers.length === 1) {
      console.log('Game should end. Winner:', alivePlayers[0].name);
      handleGameEnd(alivePlayers[0].id);
    }
  }, [players, gameEnded, handleGameEnd]);
  
  
  useEffect(() => {
    if (isTimerActive && timeLeft > 0) {
      runTimer();
    } else if (!isTimerActive && timerInterval) {
      clearInterval(timerInterval);
    }
  
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [isTimerActive, timerDuration]);  

  return (
    <View style={tw`flex-1 bg-gray-100 pt-12`}>
      <Text style={tw`text-3xl font-bold text-center mb-4`}>MTG Life Counter</Text>
      {showMiniTimer && (
        <Animated.View style={[tw`absolute top-4 right-4 bg-gray-800 p-2 rounded`, { opacity: miniTimerOpacity }]}>
          <Text style={tw`text-white font-bold`}>{formatTime(timeLeft)}</Text>
        </Animated.View>
      )}
      <View style={tw`flex-1 flex-row flex-wrap justify-center items-stretch p-2`}>
        {players.map((player, index) => (
          <View key={player.id} style={tw`${getPlayerContainerStyle(players.length, index)}`}>
            <PlayerComponent
              player={player}
              onLifeChange={(amount) => {
                handleLifeChange(player.id, amount);
                updatePlayersAndCheckEnd();
              }}
              onCommanderDamageChange={(amount) => {
                handleCommanderDamageChange(player.id, amount);
                updatePlayersAndCheckEnd();
              }}
              onPoisonCountersChange={(amount) => {
                handlePoisonCountersChange(player.id, amount);
                updatePlayersAndCheckEnd();
              }}
              onSettingsPress={() => setShowSettings(player.id)}
              onRemove={() => removePlayer(player.id)}
              disabled={gameEnded || player.isDead}
            />
          </View>
        ))}
      </View>
      <View style={tw`flex-row justify-center p-4`}>
        <Pressable style={tw`mx-2`} onPress={addPlayer} disabled={gameEnded || players.length >= 4}>
          <Ionicons name="person-add" size={24} color={gameEnded || players.length >= 4 ? "gray" : "blue"} />
        </Pressable>
        <Pressable style={tw`mx-2`} onPress={resetGame}>
          <Ionicons name="refresh" size={24} color="red" />
        </Pressable>
        <Pressable style={tw`mx-2`} onPress={() => setShowPresetModal(true)}>
          <Ionicons name="clipboard" size={24} color="brown" />
        </Pressable>
        <Pressable style={tw`mx-2`} onPress={() => setShowHistory(true)}>
          <Ionicons name="list" size={24} color="orange" />
        </Pressable>
        <Pressable style={tw`mx-2`} onPress={saveCurrentGameState}>
          <Ionicons name="save-outline" size={24} color="green" />
        </Pressable>
        <Pressable style={tw`mx-2`} onPress={() => setShowCardSearch(true)}>
          <Ionicons name="search" size={24} color="gray" />
        </Pressable>
        <Pressable style={tw`mx-2`} onPress={() => setShowDiceRoller(true)}>
          <Ionicons name="dice" size={24} color="blue" />
        </Pressable>
        <Pressable style={tw`mx-2`} onPress={() => setShowGameTimer(true)}>
          <Ionicons name="timer" size={24} color="purple" />
        </Pressable>
      </View>

      <PlayerSettings
        visible={showSettings !== null}
        player={players.find(p => p.id === showSettings) || null}
        onUpdate={(updatedPlayer) => {
          if (updatedPlayer) {
            updatePlayer(updatedPlayer);
          }
          setShowSettings(null);
        }}
        onClose={() => setShowSettings(null)}
      />

      {/* Preset Modal */}
      <Modal visible={showPresetModal} animationType="slide" transparent={true}>
        <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
          <View style={tw`bg-white p-4 rounded-lg w-4/5`}>
            <Text style={tw`text-lg font-bold mb-2`}>Presets</Text>
            {presets.map(preset => (
              <View key={preset.id} style={tw`flex-row items-center justify-between mb-2`}>
                <Pressable
                  style={tw`flex-1 bg-blue-100 p-2 rounded mr-2`}
                  onPress={() => loadPreset(preset)}
                >
                  <Text>{preset.name}</Text>
                </Pressable>
                <Pressable onPress={() => editPreset(preset.id)}>
                  <Ionicons name="pencil" size={24} color="blue" />
                </Pressable>
                <Pressable onPress={() => deletePreset(preset.id)}>
                  <Ionicons name="trash" size={24} color="red" />
                </Pressable>
              </View>
            ))}
            <Pressable
              style={tw`bg-green-500 p-2 rounded mt-2`}
              onPress={() => setShowSavePresetModal(true)}
            >
              <Text style={tw`text-white text-center`}>Save Current as Preset</Text>
            </Pressable>
            <Pressable
              style={tw`bg-red-500 p-2 rounded mt-2`}
              onPress={() => setShowPresetModal(false)}
            >
              <Text style={tw`text-white text-center`}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Save Preset Modal */}
      <Modal visible={showSavePresetModal} animationType="slide" transparent={true}>
        <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
          <View style={tw`bg-white p-4 rounded-lg w-4/5`}>
            <TextInput
              style={tw`border border-gray-300 rounded p-2 mb-4`}
              value={presetName}
              onChangeText={setPresetName}
              placeholder="Enter preset name"
            />
            <Pressable onPress={savePreset} style={tw`bg-blue-500 p-2 rounded mb-2`}>
              <Text style={tw`text-white text-center font-bold`}>Save Preset</Text>
            </Pressable>
            <Pressable onPress={() => setShowSavePresetModal(false)} style={tw`bg-red-500 p-2 rounded`}>
              <Text style={tw`text-white text-center font-bold`}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={showDiceRoller} animationType="slide" transparent={true}>
        <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
          <View style={tw`bg-white p-4 rounded-lg w-4/5`}>
            <DiceRoller onRoll={handleDiceRoll} />
            <Pressable
              style={tw`bg-red-500 p-2 rounded mt-4`}
              onPress={() => setShowDiceRoller(false)}
            >
              <Text style={tw`text-white text-center font-bold`}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Game Timer Modal */}
      <Modal visible={showGameTimer} animationType="slide" transparent={true}>
        <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
          <View style={tw`bg-white p-4 rounded-lg w-4/5`}>
            <GameTimer 
              onTimeUp={handleTimeUp}
              duration={timerDuration}
              timeLeft={timeLeft}
              isActive={isTimerActive}
              onDurationChange={(newDuration) => {
                setTimerDuration(newDuration);
                setTimeLeft(newDuration);
                setShowMiniTimer(true);
              }}
              onActiveChange={(active) => {
                setIsTimerActive(active);
                setShowMiniTimer(true);
              }}
            />
            <Pressable
              style={tw`bg-red-500 p-2 rounded mt-4`}
              onPress={() => {
                setShowGameTimer(false);
                setShowMiniTimer(true);
              }}
            >
              <Text style={tw`text-white text-center font-bold`}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <GameHistory 
        visible={showHistory} 
        history={gameHistory} 
        onClose={() => setShowHistory(false)} 
      />

      <CardSearch 
        visible={showCardSearch}
        onClose={() => setShowCardSearch(false)}
      />
    </View>
  );
}

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  const initializeFonts = useCallback(async () => {
    await loadFonts();
    setFontsLoaded(true);
  }, []);

  useEffect(() => {
    initializeFonts();
  }, [initializeFonts]);

  if (!fontsLoaded) {
    return <View><Text>Loading...</Text></View>;
  }

  return <MainContent />;
}