import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Button, Card, StatusBadge } from '@/components/ui';
import { useTransactionStore, useContactStore } from '@/state';
import { Transaction } from '@/types';
import { theme } from '@/theme';

type RouteParams = {
  txid: string;
};

export const TransactionDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { txid } = route.params as RouteParams;
  const { getTransaction } = useTransactionStore();
  const { getContactByPhone } = useContactStore();
  
  const [transaction, setTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    const tx = getTransaction(txid);
    setTransaction(tx);

    if (!tx) {
      Alert.alert('Error', 'Transaction not found', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    }
  }, [txid]);

  if (!transaction) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading transaction...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const contact = getContactByPhone(transaction.counterpartyPhone);
  const displayName = contact?.label || transaction.counterpartyPhone;
  
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
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      const number = cleaned.slice(1);
      return `+1 (${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`;
    }
    return phone;
  };

  const isReceived = transaction.direction === 'RECEIVED';
  const amountColor = isReceived ? theme.colors.success[600] : theme.colors.text.primary;
  const amountPrefix = isReceived ? '+' : '-';

  const handleRetry = () => {
    // TODO: Implement retry logic
    Alert.alert('Retry', 'Retry functionality would be implemented here');
  };

  const handleCopyTxId = () => {
    // TODO: Implement copy to clipboard
    Alert.alert('Copied', 'Transaction ID copied to clipboard');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Transaction Summary */}
          <Card style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <View style={styles.directionIndicator}>
                <Text style={styles.directionIcon}>
                  {isReceived ? '↓' : '↑'}
                </Text>
              </View>
              <View style={styles.summaryInfo}>
                <Text style={styles.summaryDirection}>
                  {isReceived ? 'Received from' : 'Sent to'}
                </Text>
                <Text style={styles.summaryContact}>{displayName}</Text>
              </View>
            </View>
            
            <View style={styles.amountContainer}>
              <Text style={[styles.amount, { color: amountColor }]}>
                {amountPrefix}{formatAmount(transaction.amountCents)}
              </Text>
              <StatusBadge status={transaction.status} />
            </View>

            {transaction.memo && (
              <View style={styles.memoContainer}>
                <Text style={styles.memoLabel}>Memo:</Text>
                <Text style={styles.memoText}>{transaction.memo}</Text>
              </View>
            )}
          </Card>

          {/* Transaction Details */}
          <Card style={styles.detailsCard}>
            <Text style={styles.cardTitle}>Transaction Details</Text>
            
            <DetailRow
              label="Transaction ID"
              value={transaction.id}
              onPress={handleCopyTxId}
              copyable
            />
            
            <DetailRow
              label="Phone Number"
              value={formatPhone(transaction.counterpartyPhone)}
            />
            
            <DetailRow
              label="Amount"
              value={formatAmount(transaction.amountCents)}
            />
            
            <DetailRow
              label="Status"
              value={<StatusBadge status={transaction.status} size="small" />}
            />
            
            <DetailRow
              label="Created"
              value={formatDate(transaction.createdAt)}
            />
            
            <DetailRow
              label="Updated"
              value={formatDate(transaction.updatedAt)}
            />
            
            <DetailRow
              label="Verified"
              value={transaction.verified ? '✅ Yes' : '❌ No'}
            />

            {transaction.deliveryMeta && (
              <DetailRow
                label="Retries"
                value={transaction.deliveryMeta.retries.toString()}
              />
            )}
          </Card>

          {/* Security Info */}
          <Card style={styles.securityCard}>
            <Text style={styles.cardTitle}>Security Information</Text>
            
            <DetailRow
              label="Signature Verified"
              value={transaction.verified ? '✅ Valid' : '❌ Invalid'}
            />
            
            <DetailRow
              label="Nonce"
              value={transaction.nonce}
            />
            
            <DetailRow
              label="Timestamp"
              value={new Date(transaction.timestamp).toISOString()}
            />
          </Card>

          {/* Raw Data */}
          <Card style={styles.rawCard}>
            <Text style={styles.cardTitle}>Raw SMS Data</Text>
            <View style={styles.rawContainer}>
              <Text style={styles.rawText} selectable>
                {transaction.raw}
              </Text>
            </View>
          </Card>

          {/* Actions */}
          <View style={styles.actions}>
            {(transaction.status === 'FAILED_TEMP' || transaction.status === 'FAILED_PERM') && (
              <Button
                title="Retry Transaction"
                onPress={handleRetry}
                variant="primary"
                fullWidth
                style={styles.actionButton}
              />
            )}
            
            <Button
              title="Close"
              onPress={() => navigation.goBack()}
              variant="outline"
              fullWidth
              style={styles.actionButton}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

interface DetailRowProps {
  label: string;
  value: string | React.ReactNode;
  onPress?: () => void;
  copyable?: boolean;
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value, onPress, copyable }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}:</Text>
    <View style={styles.detailValueContainer}>
      {typeof value === 'string' ? (
        <Text 
          style={[styles.detailValue, copyable && styles.copyableValue]}
          onPress={onPress}
          numberOfLines={copyable ? undefined : 1}
          selectable={copyable}
        >
          {value}
        </Text>
      ) : (
        value
      )}
    </View>
  </View>
);

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
  summaryCard: {
    marginBottom: theme.spacing.lg,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  directionIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  directionIcon: {
    fontSize: 20,
    color: theme.colors.primary[600],
  },
  summaryInfo: {
    flex: 1,
  },
  summaryDirection: {
    ...theme.typography.body.small,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  summaryContact: {
    ...theme.typography.heading.h4,
    color: theme.colors.text.primary,
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  amount: {
    ...theme.typography.mono.large,
    fontWeight: 'bold',
  },
  memoContainer: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
    paddingTop: theme.spacing.md,
  },
  memoLabel: {
    ...theme.typography.label.small,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  memoText: {
    ...theme.typography.body.medium,
    color: theme.colors.text.primary,
    fontStyle: 'italic',
  },
  detailsCard: {
    marginBottom: theme.spacing.lg,
  },
  securityCard: {
    marginBottom: theme.spacing.lg,
  },
  rawCard: {
    marginBottom: theme.spacing.lg,
  },
  cardTitle: {
    ...theme.typography.heading.h4,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
    minHeight: 20,
  },
  detailLabel: {
    ...theme.typography.body.small,
    color: theme.colors.text.secondary,
    flex: 1,
  },
  detailValueContainer: {
    flex: 2,
    alignItems: 'flex-end',
  },
  detailValue: {
    ...theme.typography.body.small,
    color: theme.colors.text.primary,
    textAlign: 'right',
  },
  copyableValue: {
    color: theme.colors.primary[600],
    textDecorationLine: 'underline',
  },
  rawContainer: {
    backgroundColor: theme.colors.neutral[50],
    borderRadius: theme.radius.sm,
    padding: theme.spacing.sm,
  },
  rawText: {
    ...theme.typography.mono.small,
    color: theme.colors.text.primary,
    lineHeight: 16,
  },
  actions: {
    marginTop: theme.spacing.lg,
  },
  actionButton: {
    marginBottom: theme.spacing.md,
  },
});