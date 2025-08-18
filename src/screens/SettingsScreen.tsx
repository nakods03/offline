import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button, Card } from '@/components/ui';
import { PinGate } from '@/components/security';
import { useSettingsStore, useAuthStore, useWalletStore } from '@/state';
import { theme } from '@/theme';

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { 
    cloudEnabled, 
    autoLockMs, 
    lastBackupAt,
    setCloudEnabled,
    setAutoLockMs,
    permissions,
    requestSmsPermissions,
    requestCameraPermission,
  } = useSettingsStore();
  const { updateActivity, setAutoLockTimeout } = useAuthStore();
  const { getFormattedBalance } = useWalletStore();

  const handleChangePin = () => {
    updateActivity();
    Alert.alert(
      'Change PIN',
      'This feature is not yet implemented. In a production app, this would allow users to change their PIN after verifying the current one.',
      [{ text: 'OK' }]
    );
  };

  const handleBackupWallet = () => {
    updateActivity();
    navigation.navigate('Backup');
  };

  const handleRestoreWallet = () => {
    updateActivity();
    navigation.navigate('Restore');
  };

  const handleResetWallet = () => {
    updateActivity();
    Alert.alert(
      'Reset Wallet',
      'This will permanently delete all your wallet data, including your balance, transaction history, and contacts. This action cannot be undone.\n\nAre you sure you want to continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Final Warning',
              'This is your last chance to cancel. Your wallet will be completely reset and all data will be lost forever.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Reset Now',
                  style: 'destructive',
                  onPress: () => {
                    // TODO: Implement wallet reset
                    Alert.alert('Not Implemented', 'Wallet reset functionality would be implemented here.');
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const handleAutoLockChange = (value: number) => {
    setAutoLockMs(value);
    setAutoLockTimeout(value);
  };

  const handleCloudToggle = (enabled: boolean) => {
    setCloudEnabled(enabled);
    if (enabled && !lastBackupAt) {
      Alert.alert(
        'Cloud Sync Enabled',
        'Would you like to create your first backup now?',
        [
          { text: 'Later', style: 'cancel' },
          { text: 'Backup Now', onPress: handleBackupWallet },
        ]
      );
    }
  };

  const handleRequestSmsPermissions = async () => {
    const granted = await requestSmsPermissions();
    if (granted) {
      Alert.alert('Success', 'SMS permissions have been granted!');
    } else {
      Alert.alert(
        'Permission Denied',
        'SMS permissions are required for automatic transaction processing. You can still use the app with manual SMS composition.'
      );
    }
  };

  const handleRequestCameraPermission = async () => {
    const granted = await requestCameraPermission();
    if (granted) {
      Alert.alert('Success', 'Camera permission has been granted!');
    } else {
      Alert.alert(
        'Permission Denied',
        'Camera permission is required to scan QR codes.'
      );
    }
  };

  const formatAutoLockTime = (ms: number) => {
    if (ms < 60000) {
      return `${ms / 1000}s`;
    } else {
      return `${ms / 60000}m`;
    }
  };

  return (
    <PinGate>
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.content}>
            <Text style={styles.title}>Settings</Text>

            {/* Security Settings */}
            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>🔐 Security</Text>
              
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Change PIN</Text>
                  <Text style={styles.settingDescription}>
                    Update your wallet PIN
                  </Text>
                </View>
                <Button
                  title="Change"
                  onPress={handleChangePin}
                  variant="outline"
                  size="small"
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Auto-lock Timeout</Text>
                  <Text style={styles.settingDescription}>
                    Currently: {formatAutoLockTime(autoLockMs)}
                  </Text>
                </View>
                <View style={styles.autoLockButtons}>
                  {[15000, 30000, 60000].map((ms) => (
                    <Button
                      key={ms}
                      title={formatAutoLockTime(ms)}
                      onPress={() => handleAutoLockChange(ms)}
                      variant={autoLockMs === ms ? 'primary' : 'ghost'}
                      size="small"
                      style={styles.autoLockButton}
                    />
                  ))}
                </View>
              </View>
            </Card>

            {/* Backup & Sync */}
            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>☁️ Backup & Sync</Text>
              
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Cloud Backup</Text>
                  <Text style={styles.settingDescription}>
                    Encrypt and backup your wallet to the cloud
                  </Text>
                </View>
                <Switch
                  value={cloudEnabled}
                  onValueChange={handleCloudToggle}
                  trackColor={{ 
                    false: theme.colors.neutral[300], 
                    true: theme.colors.primary[300] 
                  }}
                  thumbColor={cloudEnabled ? theme.colors.primary[600] : theme.colors.neutral[500]}
                />
              </View>

              {lastBackupAt && (
                <View style={styles.settingItem}>
                  <Text style={styles.lastBackupText}>
                    Last backup: {lastBackupAt.toLocaleDateString()}
                  </Text>
                </View>
              )}

              <View style={styles.buttonRow}>
                <Button
                  title="Backup Now"
                  onPress={handleBackupWallet}
                  variant="outline"
                  style={styles.halfButton}
                />
                <Button
                  title="Restore"
                  onPress={handleRestoreWallet}
                  variant="outline"
                  style={styles.halfButton}
                />
              </View>
            </Card>

            {/* Permissions */}
            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>📱 Permissions</Text>
              
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>SMS Permissions</Text>
                  <Text style={[
                    styles.permissionStatus,
                    { color: permissions.sms ? theme.colors.success[600] : theme.colors.warning[600] }
                  ]}>
                    {permissions.sms ? '✅ Granted' : '⚠️ Not granted'}
                  </Text>
                </View>
                {!permissions.sms && (
                  <Button
                    title="Enable"
                    onPress={handleRequestSmsPermissions}
                    variant="outline"
                    size="small"
                  />
                )}
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Camera Permission</Text>
                  <Text style={[
                    styles.permissionStatus,
                    { color: permissions.camera ? theme.colors.success[600] : theme.colors.warning[600] }
                  ]}>
                    {permissions.camera ? '✅ Granted' : '⚠️ Not granted'}
                  </Text>
                </View>
                {!permissions.camera && (
                  <Button
                    title="Enable"
                    onPress={handleRequestCameraPermission}
                    variant="outline"
                    size="small"
                  />
                )}
              </View>
            </Card>

            {/* Wallet Info */}
            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>💰 Wallet Info</Text>
              
              <View style={styles.walletInfo}>
                <View style={styles.walletInfoItem}>
                  <Text style={styles.walletInfoLabel}>Current Balance:</Text>
                  <Text style={styles.walletInfoValue}>{getFormattedBalance()}</Text>
                </View>
              </View>
            </Card>

            {/* Danger Zone */}
            <Card style={[styles.sectionCard, styles.dangerCard]}>
              <Text style={styles.dangerTitle}>⚠️ Danger Zone</Text>
              
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.dangerLabel}>Reset Wallet</Text>
                  <Text style={styles.dangerDescription}>
                    Permanently delete all wallet data. This cannot be undone.
                  </Text>
                </View>
                <Button
                  title="Reset"
                  onPress={handleResetWallet}
                  variant="danger"
                  size="small"
                />
              </View>
            </Card>

            {/* App Info */}
            <View style={styles.appInfo}>
              <Text style={styles.appInfoText}>Offline SMS Wallet v1.0.0</Text>
              <Text style={styles.appInfoText}>Built with React Native</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </PinGate>
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
  title: {
    ...theme.typography.heading.h1,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  sectionCard: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.heading.h4,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    minHeight: 48,
  },
  settingInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  settingLabel: {
    ...theme.typography.body.medium,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  settingDescription: {
    ...theme.typography.body.small,
    color: theme.colors.text.secondary,
    lineHeight: 18,
  },
  permissionStatus: {
    ...theme.typography.label.small,
    fontWeight: '600',
  },
  autoLockButtons: {
    flexDirection: 'row',
  },
  autoLockButton: {
    marginLeft: theme.spacing.xs,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfButton: {
    flex: 0.48,
  },
  lastBackupText: {
    ...theme.typography.body.small,
    color: theme.colors.text.tertiary,
    fontStyle: 'italic',
  },
  walletInfo: {
    // Additional wallet info styling
  },
  walletInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  walletInfoLabel: {
    ...theme.typography.body.medium,
    color: theme.colors.text.secondary,
  },
  walletInfoValue: {
    ...theme.typography.mono.medium,
    color: theme.colors.text.primary,
    fontWeight: '600',
  },
  dangerCard: {
    borderColor: theme.colors.error[200],
    backgroundColor: theme.colors.error[50],
  },
  dangerTitle: {
    ...theme.typography.heading.h4,
    color: theme.colors.error[700],
    marginBottom: theme.spacing.md,
  },
  dangerLabel: {
    ...theme.typography.body.medium,
    color: theme.colors.error[700],
    marginBottom: theme.spacing.xs,
  },
  dangerDescription: {
    ...theme.typography.body.small,
    color: theme.colors.error[600],
    lineHeight: 18,
  },
  appInfo: {
    alignItems: 'center',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  appInfoText: {
    ...theme.typography.caption,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing.xs,
  },
});