import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { PinPad } from '@/components/ui';
import { useAuthStore } from '@/state';
import { theme } from '@/theme';

type RouteParams = {
  onUnlock: () => void;
};

export const PinLockScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { onUnlock } = (route.params as RouteParams) || {};
  const { verifyPin } = useAuthStore();

  const handlePinComplete = async (pin: string) => {
    try {
      const isValid = await verifyPin(pin);
      
      if (isValid) {
        if (onUnlock) {
          onUnlock();
        }
        navigation.goBack();
      } else {
        // PIN verification will handle the error display
      }
    } catch (error) {
      console.error('PIN verification error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <PinPad
          title="Enter PIN"
          subtitle="Enter your PIN to unlock the wallet"
          onComplete={handlePinComplete}
          length={4}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
  },
});