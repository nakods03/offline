import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { getOrCreatePrivateKeyB64 } from '@/db/secure';
import { useAuthStore } from '@/state/auth';

export default function OnboardingScreen({ navigation }: any) {
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const setPinStore = useAuthStore(s => s.setPin);
  return (
    <View style={{ flex: 1, padding: 24 }}>
      <Text style={{ fontSize: 24, fontWeight: '700' }}>Welcome</Text>
      <TextInput value={phone} onChangeText={setPhone} placeholder="Phone (+E164)" style={{ borderWidth: 1, marginTop: 16, padding: 12, borderRadius: 8 }} />
      <TextInput value={pin} onChangeText={setPin} placeholder="PIN" secureTextEntry style={{ borderWidth: 1, marginTop: 16, padding: 12, borderRadius: 8 }} />
      <Button title="Create" onPress={async () => { await getOrCreatePrivateKeyB64(); setPinStore(pin); navigation.replace('Home'); }} />
    </View>
  );
}

