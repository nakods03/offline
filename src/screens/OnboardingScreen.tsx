import React from 'react';
import { View, Text, Button } from 'react-native';
import type { StackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';

const OnboardingScreen: React.FC<StackScreenProps<RootStackParamList, 'Onboarding'>> = ({ navigation }) => {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Welcome to Offline SMS Wallet</Text>
      <Button title="Get Started" onPress={() => navigation.replace('Home')} />
    </View>
  );
};

export default OnboardingScreen;