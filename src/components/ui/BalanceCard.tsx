import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Card } from './Card';
import { theme } from '@/theme';

interface BalanceCardProps {
  balance: string;
  isLocked?: boolean;
  onSyncPress?: () => void;
  showSync?: boolean;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  balance,
  isLocked = false,
  onSyncPress,
  showSync = false,
}) => {
  return (
    <Card style={styles.container} variant="elevated">
      <LinearGradient
        colors={[theme.colors.primary[600], theme.colors.primary[700]]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.label}>Total Balance</Text>
            <View style={styles.actions}>
              {isLocked && (
                <View style={styles.lockIcon}>
                  <Text style={styles.lockText}>🔒</Text>
                </View>
              )}
              {showSync && onSyncPress && (
                <TouchableOpacity
                  style={styles.syncButton}
                  onPress={onSyncPress}
                >
                  <Text style={styles.syncText}>Sync</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          <View style={styles.balanceContainer}>
            <Text style={styles.balance} numberOfLines={1} adjustsFontSizeToFit>
              {isLocked ? '••••••' : balance}
            </Text>
          </View>
          
          <Text style={styles.subtitle}>
            {isLocked ? 'Wallet Locked' : 'Available to send'}
          </Text>
        </View>
      </LinearGradient>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 0,
    overflow: 'hidden',
  },
  gradient: {
    borderRadius: theme.radius.lg,
  },
  content: {
    padding: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  label: {
    ...theme.typography.label.medium,
    color: theme.colors.primary[100],
    textTransform: 'uppercase',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lockIcon: {
    marginLeft: theme.spacing.sm,
  },
  lockText: {
    fontSize: 16,
  },
  syncButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.sm,
    marginLeft: theme.spacing.sm,
  },
  syncText: {
    ...theme.typography.label.small,
    color: theme.colors.text.inverse,
  },
  balanceContainer: {
    marginBottom: theme.spacing.sm,
  },
  balance: {
    ...theme.typography.mono.large,
    fontSize: 32,
    color: theme.colors.text.inverse,
    fontWeight: 'bold',
  },
  subtitle: {
    ...theme.typography.body.small,
    color: theme.colors.primary[200],
  },
});