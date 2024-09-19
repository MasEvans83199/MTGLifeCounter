import React from 'react';
import { View, Image, Text, Pressable, FlatList, Modal } from 'react-native';
import tw from '../tailwind';

const cardIcons = [
  'https://example.com/card1.jpg',
  'https://example.com/card2.jpg',
  'https://example.com/card3.jpg',
];

interface IconSelectorProps {
  visible: boolean;
  onSelect: (icon: string) => void;
  onClose: () => void;
}

const IconSelector: React.FC<IconSelectorProps> = ({ visible, onSelect, onClose }) => {
  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
        <View style={tw`bg-white p-4 rounded-lg w-4/5`}>
          <FlatList
            data={cardIcons}
            renderItem={({ item }) => (
              <Pressable onPress={() => onSelect(item)} style={tw`p-2`}>
                <Image source={{ uri: item }} style={tw`w-16 h-16 rounded`} />
              </Pressable>
            )}
            keyExtractor={(item) => item}
            numColumns={3}
          />
          <Pressable onPress={onClose} style={tw`mt-4 bg-red-500 p-2 rounded`}>
            <Text style={tw`text-white text-center font-bold`}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export default IconSelector;