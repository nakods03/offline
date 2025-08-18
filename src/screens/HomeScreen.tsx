import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { 
  BalanceCard, 
  PrimaryActionButton, 
  TransactionListItem, 
  Button 
} from '@/components/ui';
import { PermissionBanner, PinGate } from '@/components/security';
import { useWalletStore, useTransactionStore, useSettingsStore, useAuthStore } from '@/state';
import { theme } from '@/theme';

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { balance, getFormattedBalance, loadWallet } = useWalletStore();
  const { transactions, loadTransactions, getRecentTransactions } = useTransactionStore();
  const { permissions } = useSettingsStore();
  const { isLocked, updateActivity } = useAuthStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [showSmsPermissionBanner, setShowSmsPermissionBanner] = useState(true);

  useEffect(() => {
    loadData();
    updateActivity(); // Update activity on screen focus
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([
        loadWallet(),
        loadTransactions(),
      ]);
    } catch (error) {
      console.error('Failed to load home data:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSendPress = () => {
    updateActivity();
    navigation.navigate('Send');
  };

  const handleReceivePress = () => {
    updateActivity();
    navigation.navigate('Receive');
  };

  const handleTransactionPress = (txid: string) => {
    updateActivity();
    navigation.navigate('TransactionDetail', { txid });
  };

  const handleSyncPress = () => {
    // TODO: Implement cloud sync
    console.log('Sync pressed');
  };

  const recentTransactions = getRecentTransactions(5);

  return (
    <PinGate>
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary[600]}
            />
          }
        >
          {/* SMS Permission Banner */}
          {!permissions.sms && showSmsPermissionBanner && (
            <PermissionBanner
              type="sms"
              onDismiss={() => setShowSmsPermissionBanner(false)}
            />
          )}

          {/* Balance Card */}
          <View style={styles.balanceSection}>
            <BalanceCard
              balance={getFormattedBalance()}
              isLocked={isLocked}
              showSync={false} // TODO: Enable when cloud sync is implemented
              onSyncPress={handleSyncPress}
            />
          </View>

          {/* Primary Actions */}
          <View style={styles.actionsSection}>
            <View style={styles.actions}>
              <PrimaryActionButton
                title="Send"
                icon={<Text style={styles.actionIcon}>↗️</Text>}
                onPress={handleSendPress}
                variant="send"
              />
              <PrimaryActionButton
                title="Receive"
                icon={<Text style={styles.actionIcon}>↙️</Text>}
                onPress={handleReceivePress}
                variant="receive"
              />
            </View>
          </View>

          {/* Recent Transactions */}
          <View style={styles.transactionsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              {transactions.length > 5 && (
                <Button
                  title="View All"
                  onPress={() => navigation.navigate('History')}
                  variant="ghost"
                  size="small"
                />
              )}
            </View>

            {recentTransactions.length > 0 ? (
              <View style={styles.transactionsList}>
                {recentTransactions.map((transaction) => (
                  <TransactionListItem
                    key={transaction.id}
                    transaction={transaction}
                    onPress={() => handleTransactionPress(transaction.id)}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>💸</Text>
                <Text style={styles.emptyStateTitle}>No Transactions Yet</Text>
                <Text style={styles.emptyStateText}>
                  Start by sending money to someone or ask them to send you money!
                </Text>
                <Button
                  title="Send Money"
                  onPress={handleSendPress}
                  style={styles.emptyStateButton}
                />
              </View>
            )}
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
  balanceSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  actionsSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 24,
  },
  transactionsSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.heading.h3,
    color: theme.colors.text.primary,
  },
  transactionsList: {
    // Transactions are styled individually
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
  },
  emptyStateTitle: {
    ...theme.typography.heading.h4,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  emptyStateText: {
    ...theme.typography.body.medium,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    lineHeight: 22,
  },
  emptyStateButton: {
    marginTop: theme.spacing.md,
  },
});