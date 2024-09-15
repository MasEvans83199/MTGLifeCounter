import React from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity } from 'react-native';
import tw from '../tailwind';

interface GameHistoryProps {
  visible: boolean;
  history: string[];
  onClose: () => void;
}

const GameHistory: React.FC<GameHistoryProps> = ({ visible, history, onClose }) => {
  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
        <View style={tw`bg-white p-4 rounded-lg w-4/5 h-3/4`}>
          <Text style={tw`text-lg font-bold mb-2`}>Game History</Text>
          <ScrollView style={tw`mb-4`}>
            {history.map((event, index) => (
              <Text key={index} style={tw`mb-1`}>{event}</Text>
            ))}
          </ScrollView>
          <TouchableOpacity onPress={onClose} style={tw`mt-4 bg-red-500 p-2 rounded`}>
            <Text style={tw`text-white text-center font-bold`}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default GameHistory;
