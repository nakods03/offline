import React from 'react';
import { View, Text } from 'react-native';

const HomeScreen: React.FC = () => {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Balance: 0.00</Text>
    </View>
  );
};

export default HomeScreen;