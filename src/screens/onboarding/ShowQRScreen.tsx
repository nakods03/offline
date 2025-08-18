import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button, QRCard } from '@/components/ui';
import { generateWalletQR } from '@/qr/generator';
import { getRealm, dbRead } from '@/db/realm';
import { UserProfileSchema } from '@/db/models';
import { theme } from '@/theme';

export const ShowQRScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [qrData, setQrData] = useState('');
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = () => {
    try {
      const profile = dbRead(() => {
        const realm = getRealm();
        return realm.objects('UserProfile')[0] as UserProfileSchema;
      });

      if (profile) {
        setUserProfile({
          id: profile.id,
          phoneE164: profile.phoneE164,
          deviceId: profile.deviceId,
          publicKeyB64: profile.publicKeyB64,
          createdAt: profile.createdAt,
        });

        // Generate QR data
        const qrString = generateWalletQR({
          id: profile.id,
          phoneE164: profile.phoneE164,
          deviceId: profile.deviceId,
          publicKeyB64: profile.publicKeyB64,
          createdAt: profile.createdAt,
        });

        setQrData(qrString);
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  };

  const handleContinue = () => {
    // Complete onboarding and navigate to main app
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  };

  const handleSkip = () => {
    // Skip sharing and go to main app
    handleContinue();
  };

  if (!qrData || !userProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.emoji}>🎉</Text>
          <Text style={styles.title}>Wallet Ready!</Text>
          <Text style={styles.subtitle}>
            Share this QR code with others so they can send you money
          </Text>
        </View>

        <View style={styles.qrContainer}>
          <QRCard
            data={qrData}
            title="Your Wallet QR"
            subtitle={userProfile.phoneE164}
          />
        </View>

        <View style={styles.info}>
          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>📱</Text>
            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>Your Phone Number</Text>
              <Text style={styles.infoDescription}>
                Others will send money to {userProfile.phoneE164}
              </Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>🔐</Text>
            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>Security</Text>
              <Text style={styles.infoDescription}>
                Your QR contains your public key for secure verification
              </Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>📤</Text>
            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>How to Share</Text>
              <Text style={styles.infoDescription}>
                Show this QR to someone or find it later in the Receive tab
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Button
            title="Start Using Wallet"
            onPress={handleContinue}
            size="large"
            fullWidth
          />
          
          <Button
            title="Skip for Now"
            onPress={handleSkip}
            variant="ghost"
            fullWidth
            style={styles.skipButton}
          />
        </View>
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
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  emoji: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
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
  qrContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: theme.spacing.md,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    ...theme.typography.label.medium,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  infoDescription: {
    ...theme.typography.body.small,
    color: theme.colors.text.secondary,
    lineHeight: 18,
  },
  footer: {
    marginBottom: theme.spacing.lg,
  },
  skipButton: {
    marginTop: theme.spacing.md,
  },
});