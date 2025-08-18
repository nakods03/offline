import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Transaction } from '@/types';
import { Card } from './Card';
import { StatusBadge } from './StatusBadge';
import { theme } from '@/theme';

interface TransactionListItemProps {
  transaction: Transaction;
  onPress?: () => void;
}

export const TransactionListItem: React.FC<TransactionListItemProps> = ({
  transaction,
  onPress,
}) => {
  const formatAmount = (amountCents: number) => {
    const dollars = amountCents / 100;
    return dollars.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPhone = (phone: string) => {
    // Format +1234567890 to (123) 456-7890
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      const number = cleaned.slice(1);
      return `(${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`;
    }
    return phone;
  };

  const isReceived = transaction.direction === 'RECEIVED';
  const amountColor = isReceived ? theme.colors.success[600] : theme.colors.text.primary;
  const amountPrefix = isReceived ? '+' : '-';

  const content = (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.direction}>
          <Text style={styles.directionIcon}>
            {isReceived ? '↓' : '↑'}
          </Text>
        </View>
        
        <View style={styles.details}>
          <View style={styles.row}>
            <Text style={styles.phone} numberOfLines={1}>
              {formatPhone(transaction.counterpartyPhone)}
            </Text>
            <Text style={[styles.amount, { color: amountColor }]}>
              {amountPrefix}{formatAmount(transaction.amountCents)}
            </Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.date}>
              {formatDate(transaction.createdAt)}
            </Text>
            <StatusBadge status={transaction.status} size="small" />
          </View>
        </View>
      </View>
      
      {transaction.memo && (
        <Text style={styles.memo} numberOfLines={2}>
          {transaction.memo}
        </Text>
      )}
      
      {!transaction.verified && transaction.direction === 'RECEIVED' && (
        <View style={styles.warningContainer}>
          <Text style={styles.warning}>⚠️ Unverified sender</Text>
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <Card style={styles.card}>
          {content}
        </Card>
      </TouchableOpacity>
    );
  }

  return (
    <Card style={styles.card}>
      {content}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.sm,
  },
  container: {
    // No additional padding, Card provides it
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  direction: {
    width: 32,
    height: 32,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  directionIcon: {
    fontSize: 16,
    color: theme.colors.text.secondary,
  },
  details: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  phone: {
    ...theme.typography.body.medium,
    color: theme.colors.text.primary,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  amount: {
    ...theme.typography.mono.medium,
    fontWeight: '600',
  },
  date: {
    ...theme.typography.caption,
    color: theme.colors.text.tertiary,
  },
  memo: {
    ...theme.typography.body.small,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.sm,
    fontStyle: 'italic',
  },
  warningContainer: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  warning: {
    ...theme.typography.caption,
    color: theme.colors.warning[600],
  },
});