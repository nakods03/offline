import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';
import { Button } from '@/components/ui';
import { generateKeyPair } from '@/crypto/signing';
import { storePrivateKey } from '@/crypto/keystore';
import { getRealm, dbWrite } from '@/db/realm';
import { theme } from '@/theme';

type RouteParams = {
  phone: string;
};

export const GenerateKeysScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { phone } = route.params as RouteParams;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    generateWalletKeys();
  }, []);

  const generateWalletKeys = async () => {
    try {
      setProgress(10);
      await new Promise(resolve => setTimeout(resolve, 500)); // Show progress

      // Generate device ID
      setProgress(25);
      const deviceId = await DeviceInfo.getUniqueId();
      
      // Generate Ed25519 keypair
      setProgress(50);
      const { publicKey, privateKey } = generateKeyPair();
      
      // Store private key securely
      setProgress(75);
      await storePrivateKey(privateKey);
      
      // Create user profile in database
      setProgress(90);
      const userProfile = {
        id: 'default',
        phoneE164: phone,
        deviceId,
        publicKeyB64: publicKey,
        createdAt: new Date(),
      };

      dbWrite(() => {
        const realm = getRealm();
        realm.create('UserProfile', userProfile);
      });

      setProgress(100);
      await new Promise(resolve => setTimeout(resolve, 500)); // Show completion

      // Navigate to QR display
      navigation.navigate('ShowQR');
    } catch (error) {
      console.error('Key generation error:', error);
      setError('Failed to generate wallet keys. Please try again.');
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError('');
    setLoading(true);
    setProgress(0);
    generateWalletKeys();
  };

  const handleSkip = () => {
    // Skip QR display and go directly to main app
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  };

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorEmoji}>❌</Text>
            <Text style={styles.errorTitle}>Setup Failed</Text>
            <Text style={styles.errorText}>{error}</Text>
            
            <Button
              title="Try Again"
              onPress={handleRetry}
              style={styles.retryButton}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Setting Up Your Wallet</Text>
          <Text style={styles.subtitle}>
            Generating secure keys and configuring your wallet...
          </Text>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressSteps}>
            <ProgressStep
              title="Generating Keys"
              completed={progress >= 50}
              active={progress < 50}
            />
            <ProgressStep
              title="Securing Storage"
              completed={progress >= 75}
              active={progress >= 50 && progress < 75}
            />
            <ProgressStep
              title="Creating Profile"
              completed={progress >= 90}
              active={progress >= 75 && progress < 90}
            />
            <ProgressStep
              title="Finalizing"
              completed={progress >= 100}
              active={progress >= 90}
            />
          </View>

          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${progress}%` }
              ]} 
            />
          </View>

          <Text style={styles.progressText}>{progress}% Complete</Text>
        </View>

        {progress >= 100 && (
          <View style={styles.footer}>
            <Text style={styles.successEmoji}>✅</Text>
            <Text style={styles.successText}>Wallet created successfully!</Text>
            
            <Button
              title="Continue"
              onPress={() => navigation.navigate('ShowQR')}
              style={styles.continueButton}
              fullWidth
            />
            
            <Button
              title="Skip QR Setup"
              onPress={handleSkip}
              variant="ghost"
              fullWidth
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

interface ProgressStepProps {
  title: string;
  completed: boolean;
  active: boolean;
}

const ProgressStep: React.FC<ProgressStepProps> = ({ title, completed, active }) => (
  <View style={styles.step}>
    <View style={[
      styles.stepIndicator,
      completed && styles.stepCompleted,
      active && styles.stepActive,
    ]}>
      {completed ? (
        <Text style={styles.stepCheckmark}>✓</Text>
      ) : (
        <View style={styles.stepDot} />
      )}
    </View>
    <Text style={[
      styles.stepTitle,
      completed && styles.stepTitleCompleted,
      active && styles.stepTitleActive,
    ]}>
      {title}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  title: {
    ...theme.typography.heading.h1,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    ...theme.typography.body.medium,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  progressContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressSteps: {
    width: '100%',
    marginBottom: theme.spacing.xl,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  stepIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  stepCompleted: {
    backgroundColor: theme.colors.success[600],
  },
  stepActive: {
    backgroundColor: theme.colors.primary[600],
  },
  stepCheckmark: {
    color: theme.colors.text.inverse,
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.text.inverse,
  },
  stepTitle: {
    ...theme.typography.body.medium,
    color: theme.colors.text.tertiary,
  },
  stepTitleCompleted: {
    color: theme.colors.success[600],
  },
  stepTitleActive: {
    color: theme.colors.primary[600],
    fontWeight: '600',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: theme.colors.neutral[200],
    borderRadius: 4,
    marginBottom: theme.spacing.md,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary[600],
    borderRadius: 4,
  },
  progressText: {
    ...theme.typography.body.small,
    color: theme.colors.text.secondary,
  },
  footer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  successEmoji: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
  },
  successText: {
    ...theme.typography.heading.h3,
    color: theme.colors.success[600],
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  continueButton: {
    marginBottom: theme.spacing.md,
  },
  
  // Error state
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
  },
  errorTitle: {
    ...theme.typography.heading.h2,
    color: theme.colors.error[600],
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  errorText: {
    ...theme.typography.body.medium,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  retryButton: {
    marginTop: theme.spacing.lg,
  },
});