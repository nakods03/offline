import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button, Input, Card } from '@/components/ui';
import { theme } from '@/theme';

export const RestoreScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  
  const [passphrase, setPassphrase] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRestoreWallet = async () => {
    if (!passphrase.trim()) {
      Alert.alert('Error', 'Please enter your backup passphrase');
      return;
    }

    Alert.alert(
      'Confirm Restore',
      'This will replace your current wallet with the backup. Your current wallet data will be permanently lost. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          style: 'destructive',
          onPress: () => performRestore(),
        },
      ]
    );
  };

  const performRestore = async () => {
    setLoading(true);

    try {
      // TODO: Implement actual restore functionality
      // This would:
      // 1. Download backup from Firebase Storage
      // 2. Decrypt with the passphrase
      // 3. Replace current wallet data in Realm
      
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate restore

      Alert.alert(
        'Restore Successful',
        'Your wallet has been restored from backup. Please restart the app to complete the process.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Restore error:', error);
      Alert.alert(
        'Restore Failed',
        'Failed to restore wallet. Please check your passphrase and internet connection.'
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
            <Text style={styles.title}>Restore Wallet</Text>
            <Text style={styles.subtitle}>
              Restore your wallet from a cloud backup
            </Text>
          </View>

          <Card style={styles.warningCard}>
            <Text style={styles.warningTitle}>⚠️ Warning</Text>
            <Text style={styles.warningText}>
              Restoring will replace your current wallet data including:
            </Text>
            <View style={styles.warningList}>
              <Text style={styles.warningItem}>• Current balance</Text>
              <Text style={styles.warningItem}>• Transaction history</Text>
              <Text style={styles.warningItem}>• Trusted contacts</Text>
              <Text style={styles.warningItem}>• App settings</Text>
            </View>
            <Text style={styles.warningNote}>
              This action cannot be undone. Make sure you have the correct passphrase.
            </Text>
          </Card>

          <Card style={styles.formCard}>
            <Text style={styles.formTitle}>Backup Passphrase</Text>
            
            <Input
              label="Enter Passphrase"
              placeholder="Enter your backup passphrase"
              value={passphrase}
              onChangeText={setPassphrase}
              secureTextEntry
              autoCapitalize="none"
              hint="The passphrase you used when creating the backup"
            />
          </Card>

          <Card style={styles.infoCard}>
            <Text style={styles.infoTitle}>📋 Restore Process</Text>
            <View style={styles.infoList}>
              <Text style={styles.infoItem}>
                1. Enter the passphrase you used for backup
              </Text>
              <Text style={styles.infoItem}>
                2. Your backup will be downloaded and decrypted
              </Text>
              <Text style={styles.infoItem}>
                3. Current wallet data will be replaced
              </Text>
              <Text style={styles.infoItem}>
                4. App will restart to complete the process
              </Text>
            </View>
          </Card>

          <View style={styles.actions}>
            <Button
              title="Restore Wallet"
              onPress={handleRestoreWallet}
              loading={loading}
              disabled={loading || !passphrase.trim()}
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

          <View style={styles.helpSection}>
            <Text style={styles.helpTitle}>Need Help?</Text>
            <Text style={styles.helpText}>
              If you've forgotten your passphrase, unfortunately there's no way to recover it. 
              The backup is encrypted and cannot be accessed without the correct passphrase.
            </Text>
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
  warningCard: {
    backgroundColor: theme.colors.error[50],
    borderColor: theme.colors.error[200],
    borderWidth: 1,
    marginBottom: theme.spacing.lg,
  },
  warningTitle: {
    ...theme.typography.heading.h4,
    color: theme.colors.error[700],
    marginBottom: theme.spacing.md,
  },
  warningText: {
    ...theme.typography.body.medium,
    color: theme.colors.error[600],
    marginBottom: theme.spacing.sm,
    lineHeight: 20,
  },
  warningList: {
    marginLeft: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  warningItem: {
    ...theme.typography.body.medium,
    color: theme.colors.error[600],
    marginBottom: theme.spacing.xs,
    lineHeight: 20,
  },
  warningNote: {
    ...theme.typography.body.small,
    color: theme.colors.error[500],
    fontWeight: '600',
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
  infoCard: {
    marginBottom: theme.spacing.lg,
  },
  infoTitle: {
    ...theme.typography.heading.h4,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  infoList: {
    // Info list styling
  },
  infoItem: {
    ...theme.typography.body.medium,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
    lineHeight: 20,
  },
  actions: {
    marginTop: theme.spacing.lg,
  },
  primaryButton: {
    marginBottom: theme.spacing.md,
  },
  helpSection: {
    marginTop: theme.spacing.xl,
    alignItems: 'center',
  },
  helpTitle: {
    ...theme.typography.heading.h4,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  helpText: {
    ...theme.typography.body.small,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 18,
  },
});