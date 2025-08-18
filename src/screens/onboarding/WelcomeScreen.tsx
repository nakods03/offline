import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Button } from '@/components/ui';
import { theme } from '@/theme';

export const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const handleGetStarted = () => {
    navigation.navigate('PhoneInput');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary[600], theme.colors.primary[800]]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.emoji}>📱💰</Text>
            <Text style={styles.title}>Offline SMS Wallet</Text>
            <Text style={styles.subtitle}>
              Send money via SMS, even without internet
            </Text>
          </View>

          <View style={styles.features}>
            <FeatureItem
              icon="🔒"
              title="Secure & Private"
              description="End-to-end encrypted with your device's secure storage"
            />
            <FeatureItem
              icon="📶"
              title="Works Offline"
              description="Send and receive payments using only SMS"
            />
            <FeatureItem
              icon="⚡"
              title="Instant Transfers"
              description="No waiting for blockchain confirmations"
            />
            <FeatureItem
              icon="🔐"
              title="PIN Protected"
              description="Your wallet is protected with a secure PIN"
            />
          </View>

          <View style={styles.footer}>
            <Button
              title="Get Started"
              onPress={handleGetStarted}
              variant="secondary"
              size="large"
              fullWidth
            />
            
            <Text style={styles.disclaimer}>
              By continuing, you agree to keep your PIN secure and understand that lost PINs cannot be recovered.
            </Text>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

interface FeatureItemProps {
  icon: string;
  title: string;
  description: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ icon, title, description }) => (
  <View style={styles.featureItem}>
    <Text style={styles.featureIcon}>{icon}</Text>
    <View style={styles.featureText}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: theme.spacing.xxxl,
  },
  emoji: {
    fontSize: 64,
    marginBottom: theme.spacing.lg,
  },
  title: {
    ...theme.typography.display.medium,
    color: theme.colors.text.inverse,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    ...theme.typography.body.large,
    color: theme.colors.primary[100],
    textAlign: 'center',
  },
  features: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: theme.spacing.md,
    width: 32,
    textAlign: 'center',
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    ...theme.typography.heading.h4,
    color: theme.colors.text.inverse,
    marginBottom: theme.spacing.xs,
  },
  featureDescription: {
    ...theme.typography.body.medium,
    color: theme.colors.primary[200],
    lineHeight: 20,
  },
  footer: {
    marginBottom: theme.spacing.lg,
  },
  disclaimer: {
    ...theme.typography.caption,
    color: theme.colors.primary[200],
    textAlign: 'center',
    marginTop: theme.spacing.md,
    lineHeight: 16,
  },
});