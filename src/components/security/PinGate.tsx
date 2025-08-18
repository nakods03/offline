import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Modal, StatusBar } from 'react-native';
import { useAuthStore } from '@/state';
import { PinPad } from '@/components/ui';
import { theme } from '@/theme';

interface PinGateProps {
  children: React.ReactNode;
  requirePin?: boolean;
}

export const PinGate: React.FC<PinGateProps> = ({
  children,
  requirePin = true,
}) => {
  const { isLocked, hasPin, verifyPin, updateActivity } = useAuthStore();
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinError, setPinError] = useState('');

  useEffect(() => {
    // Show PIN modal if locked and PIN is required
    if (requirePin && hasPin && isLocked) {
      setShowPinModal(true);
    } else {
      setShowPinModal(false);
    }
  }, [isLocked, hasPin, requirePin]);

  const handlePinComplete = async (pin: string) => {
    try {
      const isValid = await verifyPin(pin);
      
      if (isValid) {
        setShowPinModal(false);
        setPinError('');
        updateActivity();
      } else {
        setPinError('Incorrect PIN. Please try again.');
      }
    } catch (error) {
      console.error('PIN verification error:', error);
      setPinError('An error occurred. Please try again.');
    }
  };

  const handlePinError = (error: string) => {
    setPinError(error);
  };

  // If PIN is not required or not set, show children directly
  if (!requirePin || !hasPin) {
    return <>{children}</>;
  }

  // If unlocked, show children
  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <Modal
        visible={showPinModal}
        animationType="fade"
        presentationStyle="fullScreen"
        statusBarTranslucent
      >
        <StatusBar
          backgroundColor={theme.colors.background}
          barStyle="dark-content"
        />
        <View style={styles.container}>
          <PinPad
            title="Enter PIN"
            subtitle="Enter your PIN to unlock the wallet"
            onComplete={handlePinComplete}
            onError={handlePinError}
            showForgot={false}
          />
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});