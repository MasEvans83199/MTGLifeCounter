import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, Pressable, FlatList, Image, Modal, ActivityIndicator, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import tw from '../tailwind';

interface Card {
  id: string;
  name: string;
  image_uris?: {
    small: string;
    normal: string;
  };
  oracle_text?: string;
  legalities?: {
    [format: string]: string;
  };
}

interface CardSearchProps {
  visible: boolean;
  onClose: () => void;
}

const CardSearch: React.FC<CardSearchProps> = ({ visible, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Card[]>([]);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchCards = useCallback(async (term: string) => {
    if (term.trim() === '') return;
    setLoading(true);
    setError(null);

    try {
      const cachedResults = await AsyncStorage.getItem(`card_search_${term}`);
      if (cachedResults) {
        setSearchResults(JSON.parse(cachedResults));
        setLoading(false);
        return;
      }

      const response = await fetch(
        `https://api.scryfall.com/cards/search?q=${encodeURIComponent(term)}`,
        {
          headers: {
            'User-Agent': 'MTGLifeCounter/1.0',
            'Accept': 'application/json'
          }
        }
      );

      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      const data = await response.json();
      setSearchResults(data.data || []);

      await AsyncStorage.setItem(`card_search_${term}`, JSON.stringify(data.data || []));

    } catch (error: unknown) {
      console.error('Error searching cards:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while searching for cards.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = () => {
    if (searchTerm.trim() !== '') {
      searchCards(searchTerm);
    }
  };

  const resetState = () => {
    setSearchTerm('');
    setSearchResults([]);
    setSelectedCard(null);
    setError(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const renderCardItem = ({ item }: { item: Card }) => (
    <Pressable
      style={tw`p-2`}
      onPress={() => setSelectedCard(item)}
    >
      {item.image_uris?.small ? (
        <Image
          source={{ uri: item.image_uris.small }}
          style={tw`w-20 h-28 rounded`}
        />
      ) : (
        <View style={tw`w-20 h-28 bg-gray-300 rounded justify-center items-center`}>
          <Text>No image</Text>
        </View>
      )}
      <Text style={tw`text-xs mt-1 text-center`}>{item.name}</Text>
    </Pressable>
  );

  const renderLegalities = (legalities: { [format: string]: string }) => {
    const formatOrder = [
      'standard', 'pioneer', 'modern', 'legacy', 'vintage', 'commander', 'pauper', 'brawl', 'historic', 'penny'
    ];

    return (
      <View style={tw`mt-4`}>
        <Text style={tw`text-lg font-bold mb-2`}>Legalities</Text>
        {formatOrder.map((format) => {
          const legality = legalities[format] || 'not_legal';
          const color = legality === 'legal' ? 'green' : legality === 'restricted' ? 'orange' : 'red';
          const icon = legality === 'legal' ? 'checkmark-circle' : legality === 'restricted' ? 'alert-circle' : 'close-circle';
          
          return (
            <View key={format} style={tw`flex-row items-center mb-1`}>
              <Ionicons name={icon} size={16} color={color} style={tw`mr-2`} />
              <Text style={tw`capitalize flex-1`}>{format}</Text>
              <Text style={tw`capitalize text-${color}-500`}>{legality.replace('_', ' ')}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={tw`flex-1 p-4`}>
        <Text style={tw`text-2xl font-bold mb-4`}>Card Search</Text>
        <View style={tw`flex-row mb-4`}>
          <TextInput
            style={tw`flex-1 border border-gray-300 rounded-l p-2`}
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholder="Search for a card"
            onSubmitEditing={handleSearch}
          />
          <Pressable
            style={tw`bg-blue-500 px-4 justify-center rounded-r`}
            onPress={handleSearch}
          >
            <Text style={tw`text-white font-bold`}>Search</Text>
          </Pressable>
        </View>
        {loading && <ActivityIndicator size="large" color="#0000ff" />}
        {error && <Text style={tw`text-red-500 mb-2`}>{error}</Text>}
        <FlatList
          data={searchResults}
          renderItem={renderCardItem}
          keyExtractor={item => item.id}
          numColumns={3}
        />
        {selectedCard && (
          <Modal visible={!!selectedCard} transparent={true} animationType="fade">
            <View style={tw`flex-1 bg-black bg-opacity-50 justify-center items-center`}>
              <View style={tw`bg-white p-4 rounded-lg flex-row max-w-4xl w-full`}>
                <Image
                  source={{ uri: selectedCard.image_uris?.normal }}
                  style={tw`w-64 h-88 rounded`}
                  resizeMode="contain"
                />
                <ScrollView style={tw`ml-4 flex-1`}>
                  <Text style={tw`text-2xl font-bold mb-2`}>{selectedCard.name}</Text>
                  <Text style={tw`text-gray-600 mb-4`}>{selectedCard.oracle_text}</Text>
                  {renderLegalities(selectedCard.legalities || {})}
                </ScrollView>
                <Pressable
                  style={tw`absolute top-2 right-2 bg-red-500 p-2 rounded-full`}
                  onPress={() => setSelectedCard(null)}
                >
                  <Ionicons name="close" size={24} color="white" />
                </Pressable>
              </View>
            </View>
          </Modal>
        )}
        <Pressable
          style={tw`bg-red-500 p-2 rounded mt-4`}
          onPress={handleClose}
        >
          <Text style={tw`text-white text-center font-bold`}>Close</Text>
        </Pressable>
      </View>
    </Modal>
  );
};

export default CardSearch;