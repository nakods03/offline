import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { PinPad, Button } from '@/components/ui';
import { useAuthStore } from '@/state';
import { theme } from '@/theme';

type RouteParams = {
  phone: string;
};

export const CreatePinScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { phone } = route.params as RouteParams;
  const { setPin } = useAuthStore();
  
  const [step, setStep] = useState<'create' | 'confirm'>('create');
  const [firstPin, setFirstPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePinComplete = async (pin: string) => {
    if (step === 'create') {
      // First PIN entry
      setFirstPin(pin);
      setStep('confirm');
    } else {
      // PIN confirmation
      if (pin === firstPin) {
        // PINs match, save and continue
        setLoading(true);
        
        try {
          await setPin(pin);
          
          // Navigate to key generation
          navigation.navigate('GenerateKeys', { phone });
        } catch (error) {
          console.error('Failed to set PIN:', error);
          Alert.alert('Error', 'Failed to save PIN. Please try again.');
        } finally {
          setLoading(false);
        }
      } else {
        // PINs don't match
        Alert.alert(
          'PINs Don\'t Match',
          'The PINs you entered don\'t match. Please try again.',
          [
            {
              text: 'OK',
              onPress: () => {
                setStep('create');
                setFirstPin('');
              },
            },
          ]
        );
      }
    }
  };

  const handleBack = () => {
    if (step === 'confirm') {
      setStep('create');
      setFirstPin('');
    } else {
      navigation.goBack();
    }
  };

  const getTitle = () => {
    return step === 'create' ? 'Create Your PIN' : 'Confirm Your PIN';
  };

  const getSubtitle = () => {
    return step === 'create'
      ? 'Choose a 4-digit PIN to secure your wallet'
      : 'Enter your PIN again to confirm';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.phoneNumber}>📱 {phone}</Text>
        </View>

        <View style={styles.pinContainer}>
          <PinPad
            title={getTitle()}
            subtitle={getSubtitle()}
            onComplete={handlePinComplete}
            length={4}
          />
        </View>

        {!loading && (
          <View style={styles.footer}>
            <Button
              title="Back"
              onPress={handleBack}
              variant="ghost"
              fullWidth
            />
            
            <View style={styles.securityInfo}>
              <Text style={styles.securityTitle}>🔐 Security Notice</Text>
              <Text style={styles.securityText}>
                Your PIN cannot be recovered if lost. Make sure to remember it or write it down securely.
              </Text>
            </View>
          </View>
        )}
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
    padding: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  phoneNumber: {
    ...theme.typography.body.medium,
    color: theme.colors.text.secondary,
  },
  pinContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  footer: {
    marginBottom: theme.spacing.lg,
  },
  securityInfo: {
    backgroundColor: theme.colors.warning[50],
    borderColor: theme.colors.warning[200],
    borderWidth: 1,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  securityTitle: {
    ...theme.typography.label.medium,
    color: theme.colors.warning[800],
    marginBottom: theme.spacing.sm,
  },
  securityText: {
    ...theme.typography.body.small,
    color: theme.colors.warning[700],
    lineHeight: 18,
  },
});