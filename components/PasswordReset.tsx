import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import tw from '../tailwind';

interface PasswordResetProps {
  onBack: () => void;
}

const PasswordReset: React.FC<PasswordResetProps> = ({ onBack }) => {
  const [email, setEmail] = useState('');

  const handleResetPassword = async () => {
    try {
      await auth().sendPasswordResetEmail(email);
      Alert.alert('Success', 'Password reset email sent');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={tw`flex-1 justify-center items-center p-4`}>
      <Text style={tw`text-2xl font-bold mb-6`}>Reset Password</Text>
      <TextInput
        style={tw`w-full bg-gray-100 rounded-md p-2 mb-4`}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Pressable
        style={tw`w-full bg-blue-500 rounded-md p-2 mb-4`}
        onPress={handleResetPassword}
      >
        <Text style={tw`text-white text-center font-bold`}>Reset Password</Text>
      </Pressable>
      <Pressable onPress={onBack}>
        <Text style={tw`text-blue-500`}>Back to Sign In</Text>
      </Pressable>
    </View>
  );
};

export default PasswordReset;
