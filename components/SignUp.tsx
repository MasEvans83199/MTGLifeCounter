import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import tw from '../tailwind';

interface SignUpProps {
  onSignUp: (user: FirebaseAuthTypes.User) => void;
  onSwitchToSignIn: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ onSignUp, onSwitchToSignIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async () => {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      Alert.alert('Success', 'Account created successfully');
      onSignUp(userCredential.user);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={tw`flex-1 justify-center p-4`}>
      <TextInput
        style={tw`mb-4 p-2 border border-gray-300 rounded`}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={tw`mb-4 p-2 border border-gray-300 rounded`}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Pressable
        style={tw`bg-blue-500 p-3 rounded mb-4`}
        onPress={handleSignUp}
      >
        <Text style={tw`text-white text-center font-bold`}>Sign Up</Text>
      </Pressable>
      <Pressable onPress={onSwitchToSignIn}>
        <Text style={tw`text-blue-500 text-center`}>Already have an account? Sign In</Text>
      </Pressable>
    </View>
  );
};

export default SignUp;
