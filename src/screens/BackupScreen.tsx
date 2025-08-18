import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button, Input, Card } from '@/components/ui';
import { useSettingsStore } from '@/state';
import { theme } from '@/theme';

export const BackupScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { updateLastBackup } = useSettingsStore();
  
  const [passphrase, setPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [loading, setLoading] = useState(false);

  const validateInputs = (): { valid: boolean; error?: string } => {
    if (!passphrase.trim()) {
      return { valid: false, error: 'Please enter a passphrase' };
    }

    if (passphrase.length < 8) {
      return { valid: false, error: 'Passphrase must be at least 8 characters' };
    }

    if (passphrase !== confirmPassphrase) {
      return { valid: false, error: 'Passphrases do not match' };
    }

    return { valid: true };
  };

  const handleCreateBackup = async () => {
    const validation = validateInputs();
    if (!validation.valid) {
      Alert.alert('Invalid Input', validation.error);
      return;
    }

    setLoading(true);

    try {
      // TODO: Implement actual backup functionality
      // This would:
      // 1. Collect all wallet data from Realm
      // 2. Encrypt with the passphrase
      // 3. Upload to Firebase Storage
      
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate backup

      updateLastBackup();

      Alert.alert(
        'Backup Successful',
        'Your wallet has been backed up to the cloud. Keep your passphrase safe - you will need it to restore your wallet.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Backup error:', error);
      Alert.alert(
        'Backup Failed',
        'Failed to create backup. Please check your internet connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Backup Wallet</Text>
            <Text style={styles.subtitle}>
              Create an encrypted backup of your wallet in the cloud
            </Text>
          </View>

          <Card style={styles.infoCard}>
            <Text style={styles.infoTitle}>🔐 What gets backed up?</Text>
            <View style={styles.infoList}>
              <Text style={styles.infoItem}>• Your wallet balance</Text>
              <Text style={styles.infoItem}>• Transaction history</Text>
              <Text style={styles.infoItem}>• Trusted contacts</Text>
              <Text style={styles.infoItem}>• App settings</Text>
            </View>
            <Text style={styles.infoNote}>
              Your private keys and PIN are encrypted with your passphrase before backup.
            </Text>
          </Card>

          <Card style={styles.formCard}>
            <Text style={styles.formTitle}>Backup Passphrase</Text>
            
            <Input
              label="Create Passphrase"
              placeholder="Enter a strong passphrase"
              value={passphrase}
              onChangeText={setPassphrase}
              secureTextEntry
              autoCapitalize="none"
              hint="At least 8 characters"
            />

            <Input
              label="Confirm Passphrase"
              placeholder="Enter passphrase again"
              value={confirmPassphrase}
              onChangeText={setConfirmPassphrase}
              secureTextEntry
              autoCapitalize="none"
              error={
                confirmPassphrase && passphrase !== confirmPassphrase
                  ? 'Passphrases do not match'
                  : undefined
              }
            />
          </Card>

          <Card style={styles.warningCard}>
            <Text style={styles.warningTitle}>⚠️ Important</Text>
            <View style={styles.warningList}>
              <Text style={styles.warningItem}>
                • Write down your passphrase and store it safely
              </Text>
              <Text style={styles.warningItem}>
                • Without the passphrase, your backup cannot be restored
              </Text>
              <Text style={styles.warningItem}>
                • Anyone with your passphrase can access your wallet
              </Text>
            </View>
          </Card>

          <View style={styles.actions}>
            <Button
              title="Create Backup"
              onPress={handleCreateBackup}
              loading={loading}
              disabled={loading || !passphrase || !confirmPassphrase}
              size="large"
              fullWidth
              style={styles.primaryButton}
            />

            <Button
              title="Cancel"
              onPress={() => navigation.goBack()}
              variant="outline"
              fullWidth
              disabled={loading}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    ...theme.typography.heading.h1,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...theme.typography.body.medium,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  infoCard: {
    marginBottom: theme.spacing.lg,
  },
  infoTitle: {
    ...theme.typography.heading.h4,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  infoList: {
    marginBottom: theme.spacing.md,
  },
  infoItem: {
    ...theme.typography.body.medium,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
    lineHeight: 20,
  },
  infoNote: {
    ...theme.typography.body.small,
    color: theme.colors.text.tertiary,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  formCard: {
    marginBottom: theme.spacing.lg,
  },
  formTitle: {
    ...theme.typography.heading.h4,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  warningCard: {
    backgroundColor: theme.colors.warning[50],
    borderColor: theme.colors.warning[200],
    borderWidth: 1,
    marginBottom: theme.spacing.lg,
  },
  warningTitle: {
    ...theme.typography.heading.h4,
    color: theme.colors.warning[800],
    marginBottom: theme.spacing.md,
  },
  warningList: {
    // Warning list styling
  },
  warningItem: {
    ...theme.typography.body.medium,
    color: theme.colors.warning[700],
    marginBottom: theme.spacing.sm,
    lineHeight: 20,
  },
  actions: {
    marginTop: theme.spacing.lg,
  },
  primaryButton: {
    marginBottom: theme.spacing.md,
  },
});