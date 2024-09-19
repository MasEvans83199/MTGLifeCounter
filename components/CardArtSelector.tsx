import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, Pressable, Image, FlatList, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import tw from '../tailwind';

interface CardArtSelectorProps {
  onSelectArt: (artUrl: string | null) => void;
}

const CardArtSelector: React.FC<CardArtSelectorProps> = ({ onSelectArt }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchCards = useCallback(async (term: string) => {
    if (term.trim() === '') return;

    setLoading(true);
    setError('');

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

  const handleSubmit = () => {
    searchCards(searchTerm);
  };

  interface CardItem {
    id: string;
    name: string;
    image_uris?: {
      art_crop?: string;
    };
  }

  const renderCardItem = ({ item }: { item: CardItem}) => (
    <Pressable
      style={tw`p-2`}
      onPress={() => {
        if (item.image_uris?.art_crop) {
          onSelectArt(item.image_uris.art_crop);
        }
      }}
    >
      <Image
        source={{ uri: item.image_uris?.art_crop || 'default_image_url' }}
        style={tw`w-20 h-20 rounded`}
      />
      <Text style={tw`text-xs mt-1 text-center`}>{item.name}</Text>
    </Pressable>
  );

  return (
    <View style={tw`flex-1 p-4`}>
      <View style={tw`flex-row mb-4`}>
        <TextInput
          style={tw`flex-1 border border-gray-300 rounded-l p-2`}
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholder="Search for a card"
        />
        <Pressable
          style={tw`bg-blue-500 px-4 justify-center rounded-r`}
          onPress={handleSubmit}
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
    </View>
  );
};

export default CardArtSelector;