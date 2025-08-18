import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button, TransactionListItem } from '@/components/ui';
import { PinGate } from '@/components/security';
import { useTransactionStore, useAuthStore } from '@/state';
import { FilterType, Transaction } from '@/types';
import { theme } from '@/theme';

const FILTER_OPTIONS: { key: FilterType; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'SENT', label: 'Sent' },
  { key: 'RECEIVED', label: 'Received' },
  { key: 'PENDING', label: 'Pending' },
];

export const HistoryScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { 
    transactions, 
    filter, 
    loading, 
    loadTransactions, 
    setFilter, 
    getFilteredTransactions 
  } = useTransactionStore();
  const { updateActivity } = useAuthStore();
  
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadTransactions();
    updateActivity();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  const handleTransactionPress = (transaction: Transaction) => {
    updateActivity();
    navigation.navigate('TransactionDetail', { txid: transaction.id });
  };

  const handleFilterPress = (newFilter: FilterType) => {
    updateActivity();
    setFilter(newFilter);
  };

  const filteredTransactions = getFilteredTransactions();

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <TransactionListItem
      transaction={item}
      onPress={() => handleTransactionPress(item)}
    />
  );

  const renderEmptyState = () => {
    const getEmptyMessage = () => {
      switch (filter) {
        case 'SENT':
          return {
            icon: '↗️',
            title: 'No Sent Transactions',
            subtitle: 'You haven\'t sent any money yet. Tap Send to get started!',
          };
        case 'RECEIVED':
          return {
            icon: '↙️',
            title: 'No Received Transactions',
            subtitle: 'You haven\'t received any money yet. Share your QR code to receive payments!',
          };
        case 'PENDING':
          return {
            icon: '⏳',
            title: 'No Pending Transactions',
            subtitle: 'All your transactions have been completed.',
          };
        default:
          return {
            icon: '📋',
            title: 'No Transactions Yet',
            subtitle: 'Your transaction history will appear here once you start sending or receiving money.',
          };
      }
    };

    const { icon, title, subtitle } = getEmptyMessage();

    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateIcon}>{icon}</Text>
        <Text style={styles.emptyStateTitle}>{title}</Text>
        <Text style={styles.emptyStateText}>{subtitle}</Text>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Transaction History</Text>
      
      <View style={styles.filterContainer}>
        {FILTER_OPTIONS.map((option) => (
          <Button
            key={option.key}
            title={option.label}
            onPress={() => handleFilterPress(option.key)}
            variant={filter === option.key ? 'primary' : 'ghost'}
            size="small"
            style={styles.filterButton}
          />
        ))}
      </View>

      {filteredTransactions.length > 0 && (
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryText}>
            {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
            {filter !== 'ALL' && ` (${filter.toLowerCase()})`}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <PinGate>
      <SafeAreaView style={styles.container}>
        <FlatList
          data={filteredTransactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary[600]}
            />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </PinGate>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listContent: {
    flexGrow: 1,
    padding: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    ...theme.typography.heading.h1,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.neutral[50],
    borderRadius: theme.radius.md,
    padding: theme.spacing.xs,
  },
  filterButton: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
  summaryContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  summaryText: {
    ...theme.typography.body.small,
    color: theme.colors.text.tertiary,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxxl,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.lg,
  },
  emptyStateTitle: {
    ...theme.typography.heading.h3,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  emptyStateText: {
    ...theme.typography.body.medium,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: theme.spacing.lg,
  },
});