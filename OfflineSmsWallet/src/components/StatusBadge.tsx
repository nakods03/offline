import React from 'react';
import { Text, View } from 'react-native';

export default function StatusBadge({ label, color }: { label: string; color?: string }) {
  return (
    <View style={{ paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12, backgroundColor: color ?? '#E5E7EB' }}>
      <Text style={{ fontSize: 12 }}>{label}</Text>
    </View>
  );
}

