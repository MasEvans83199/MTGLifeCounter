import React from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import tw from '../tailwind';

interface SignedInViewProps {
  onSignOut: () => void;
}

const SignedInView: React.FC<SignedInViewProps> = ({ onSignOut }) => {
  const handleSignOut = async () => {
    try {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
      onSignOut();
    } catch (error) {
      Alert.alert('Error', 'An error occurred while signing out');
    }
  };

  return (
    <View style={tw`flex-1 justify-center items-center p-4`}>
      <Text style={tw`text-2xl font-bold mb-6`}>Welcome!</Text>
      <Text style={tw`text-lg mb-6`}>You are signed in.</Text>
      <Pressable
        style={tw`w-full bg-red-500 rounded-md p-2 mb-4`}
        onPress={handleSignOut}
      >
        <Text style={tw`text-white text-center font-bold`}>Sign Out</Text>
      </Pressable>
    </View>
  );
};

export default SignedInView;