import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button, QRCard, Card } from '@/components/ui';
import { PermissionBanner, PinGate } from '@/components/security';
import { generateWalletQR } from '@/qr/generator';
import { useSettingsStore, useAuthStore } from '@/state';
import { getRealm, dbRead } from '@/db/realm';
import { UserProfileSchema } from '@/db/models';
import { theme } from '@/theme';

export const ReceiveScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { permissions } = useSettingsStore();
  const { updateActivity } = useAuthStore();
  
  const [qrData, setQrData] = useState('');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showCameraPermissionBanner, setShowCameraPermissionBanner] = useState(true);

  useEffect(() => {
    loadUserProfile();
    updateActivity();
  }, []);

  const loadUserProfile = () => {
    try {
      const profile = dbRead(() => {
        const realm = getRealm();
        return realm.objects('UserProfile')[0] as UserProfileSchema;
      });

      if (profile) {
        const profileData = {
          id: profile.id,
          phoneE164: profile.phoneE164,
          deviceId: profile.deviceId,
          publicKeyB64: profile.publicKeyB64,
          createdAt: profile.createdAt,
        };

        setUserProfile(profileData);

        // Generate QR data
        const qrString = generateWalletQR(profileData);
        setQrData(qrString);
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
      Alert.alert('Error', 'Failed to load wallet information');
    }
  };

  const handleScanSenderQR = () => {
    updateActivity();
    
    if (!permissions.camera) {
      Alert.alert(
        'Camera Permission Required',
        'Please enable camera permission to scan QR codes.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Enable',
            onPress: () => {
              // Permission banner will handle the request
              setShowCameraPermissionBanner(true);
            },
          },
        ]
      );
      return;
    }

    navigation.navigate('QRScanner', {
      onScan: (qrData: any) => {
        // Add contact from QR
        Alert.alert(
          'Add Contact',
          `Add ${qrData.name || qrData.phone} as a trusted contact?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Add Contact',
              onPress: () => {
                // TODO: Implement add contact functionality
                console.log('Adding contact:', qrData);
                Alert.alert('Success', 'Contact added successfully!');
              },
            },
          ]
        );
        navigation.goBack();
      },
    });
  };

  const handleShareQR = () => {
    updateActivity();
    // TODO: Implement native sharing
    Alert.alert('Share QR', 'QR sharing functionality would be implemented here');
  };

  if (!qrData || !userProfile) {
    return (
      <PinGate>
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading wallet information...</Text>
          </View>
        </SafeAreaView>
      </PinGate>
    );
  }

  return (
    <PinGate>
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.content}>
            {/* Camera Permission Banner */}
            {!permissions.camera && showCameraPermissionBanner && (
              <PermissionBanner
                type="camera"
                onDismiss={() => setShowCameraPermissionBanner(false)}
              />
            )}

            <View style={styles.header}>
              <Text style={styles.title}>Receive Money</Text>
              <Text style={styles.subtitle}>
                Show your QR code or share your phone number
              </Text>
            </View>

            {/* My QR Code */}
            <View style={styles.qrSection}>
              <QRCard
                data={qrData}
                title="Your Wallet QR"
                subtitle={userProfile.phoneE164}
              />
              
              <Button
                title="Share QR Code"
                onPress={handleShareQR}
                variant="outline"
                fullWidth
                style={styles.shareButton}
              />
            </View>

            {/* Instructions */}
            <Card style={styles.instructionsCard}>
              <Text style={styles.instructionsTitle}>📋 How to Receive Money</Text>
              
              <View style={styles.instruction}>
                <Text style={styles.instructionNumber}>1.</Text>
                <Text style={styles.instructionText}>
                  Show this QR code to the sender, or share your phone number: {userProfile.phoneE164}
                </Text>
              </View>

              <View style={styles.instruction}>
                <Text style={styles.instructionNumber}>2.</Text>
                <Text style={styles.instructionText}>
                  They will send money via SMS to your phone number
                </Text>
              </View>

              <View style={styles.instruction}>
                <Text style={styles.instructionNumber}>3.</Text>
                <Text style={styles.instructionText}>
                  Your wallet will automatically receive and verify the transaction
                </Text>
              </View>
            </Card>

            {/* Trust Management */}
            <Card style={styles.trustCard}>
              <Text style={styles.trustTitle}>🔐 Trust & Security</Text>
              
              <Text style={styles.trustText}>
                For maximum security, scan the sender's QR code to add them as a trusted contact. 
                This ensures their transactions are automatically verified.
              </Text>
              
              <Button
                title="Scan Sender's QR"
                onPress={handleScanSenderQR}
                variant="outline"
                fullWidth
                style={styles.scanButton}
                leftIcon={<Text>📷</Text>}
              />
            </Card>

            {/* SMS Status */}
            <Card style={styles.statusCard}>
              <Text style={styles.statusTitle}>📱 SMS Status</Text>
              
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>SMS Permissions:</Text>
                <Text style={[
                  styles.statusValue,
                  { color: permissions.sms ? theme.colors.success[600] : theme.colors.warning[600] }
                ]}>
                  {permissions.sms ? '✅ Enabled' : '⚠️ Limited'}
                </Text>
              </View>

              <Text style={styles.statusDescription}>
                {permissions.sms
                  ? 'Your wallet can automatically receive and process SMS transactions.'
                  : 'Enable SMS permissions for automatic transaction processing.'
                }
              </Text>
            </Card>
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...theme.typography.body.medium,
    color: theme.colors.text.secondary,
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
  },
  qrSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  shareButton: {
    marginTop: theme.spacing.md,
  },
  instructionsCard: {
    marginBottom: theme.spacing.lg,
  },
  instructionsTitle: {
    ...theme.typography.heading.h4,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  instruction: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  instructionNumber: {
    ...theme.typography.label.medium,
    color: theme.colors.primary[600],
    fontWeight: 'bold',
    marginRight: theme.spacing.sm,
    width: 20,
  },
  instructionText: {
    ...theme.typography.body.medium,
    color: theme.colors.text.secondary,
    flex: 1,
    lineHeight: 20,
  },
  trustCard: {
    marginBottom: theme.spacing.lg,
  },
  trustTitle: {
    ...theme.typography.heading.h4,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  trustText: {
    ...theme.typography.body.medium,
    color: theme.colors.text.secondary,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  scanButton: {
    marginTop: theme.spacing.sm,
  },
  statusCard: {
    marginBottom: theme.spacing.lg,
  },
  statusTitle: {
    ...theme.typography.heading.h4,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  statusLabel: {
    ...theme.typography.body.medium,
    color: theme.colors.text.secondary,
  },
  statusValue: {
    ...theme.typography.label.medium,
    fontWeight: '600',
  },
  statusDescription: {
    ...theme.typography.body.small,
    color: theme.colors.text.tertiary,
    lineHeight: 18,
  },
});