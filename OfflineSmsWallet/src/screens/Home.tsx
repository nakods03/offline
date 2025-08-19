import React from 'react';
import { View, Text, Button } from 'react-native';
import { useWalletStore } from '@/state/wallet';

export default function HomeScreen() {
  const balance = useWalletStore(s => s.balanceCents);
  return (
    <View style={{ flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 32, fontWeight: '700' }}>Balance</Text>
      <Text style={{ fontSize: 28, marginTop: 8 }}>${(balance/100).toFixed(2)}</Text>
    </View>
  );
}

