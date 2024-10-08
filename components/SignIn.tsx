import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import tw from '../tailwind';

interface SignInProps {
  onSignIn: (user: FirebaseAuthTypes.User) => void;
  onSwitchToSignUp: () => void;
  onForgotPassword: () => void;
}

const SignIn: React.FC<SignInProps> = ({ onSignIn, onSwitchToSignUp, onForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async () => {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      onSignIn(userCredential.user);
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
        onPress={handleSignIn}
      >
        <Text style={tw`text-white text-center font-bold`}>Sign In</Text>
      </Pressable>
      <Pressable onPress={onSwitchToSignUp}>
        <Text style={tw`text-blue-500 text-center`}>Don't have an account? Sign Up</Text>
      </Pressable>
      <Pressable onPress={onForgotPassword}>
        <Text style={tw`text-blue-500 text-center mt-2`}>Forgot Password?</Text>
      </Pressable>
    </View>
  );
};

export default SignIn;
