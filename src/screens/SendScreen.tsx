import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button, Input, Card } from '@/components/ui';
import { PinGate } from '@/components/security';
import { useWalletStore, useTransactionStore, useAuthStore, useContactStore } from '@/state';
import { formatToE164 } from '@/sms/protocol';
import { DraftTransaction } from '@/types';
import { theme } from '@/theme';

export const SendScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { balance, balanceInDollars, getFormattedBalance } = useWalletStore();
  const { sendTransaction } = useTransactionStore();
  const { updateActivity } = useAuthStore();
  const { getContactByPhone } = useContactStore();
  
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleScanQR = () => {
    updateActivity();
    navigation.navigate('QRScanner', {
      onScan: (qrData: any) => {
        setRecipient(qrData.phone);
        navigation.goBack();
      },
    });
  };

  const validateInputs = (): { valid: boolean; error?: string } => {
    if (!recipient.trim()) {
      return { valid: false, error: 'Please enter recipient phone number' };
    }

    const formattedRecipient = formatToE164(recipient.trim());
    if (!formattedRecipient) {
      return { valid: false, error: 'Please enter a valid phone number with country code' };
    }

    if (!amount.trim()) {
      return { valid: false, error: 'Please enter an amount' };
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return { valid: false, error: 'Please enter a valid amount greater than 0' };
    }

    if (amountNum > balanceInDollars()) {
      return { valid: false, error: 'Insufficient balance' };
    }

    if (memo.length > 100) {
      return { valid: false, error: 'Memo must be less than 100 characters' };
    }

    return { valid: true };
  };

  const handleSend = async () => {
    updateActivity();
    
    const validation = validateInputs();
    if (!validation.valid) {
      Alert.alert('Invalid Input', validation.error);
      return;
    }

    const formattedRecipient = formatToE164(recipient.trim());
    const amountCents = Math.round(parseFloat(amount) * 100);
    
    // Check if recipient is a known contact
    const contact = getContactByPhone(formattedRecipient!);
    const contactName = contact?.label || contact?.phoneE164;

    Alert.alert(
      'Confirm Transaction',
      `Send ${amount} to ${contactName || formattedRecipient}${memo ? `\n\nMemo: ${memo}` : ''}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          style: 'default',
          onPress: () => processSend(formattedRecipient!, amountCents),
        },
      ]
    );
  };

  const processSend = async (to: string, amountCents: number) => {
    setLoading(true);
    
    try {
      const draft: DraftTransaction = {
        to,
        amountCents,
        memo: memo.trim() || undefined,
      };

      const txid = await sendTransaction(draft);
      
      Alert.alert(
        'Transaction Sent',
        'Your transaction has been sent via SMS. You will be notified when it is delivered.',
        [
          {
            text: 'View Details',
            onPress: () => {
              navigation.navigate('TransactionDetail', { txid });
            },
          },
          {
            text: 'OK',
            onPress: () => {
              // Clear form and go back to home
              setRecipient('');
              setAmount('');
              setMemo('');
              navigation.navigate('Home');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Send transaction error:', error);
      Alert.alert(
        'Send Failed',
        error instanceof Error ? error.message : 'Failed to send transaction. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleMaxAmount = () => {
    const maxAmount = balanceInDollars();
    setAmount(maxAmount.toFixed(2));
  };

  const formatAmountInput = (text: string) => {
    // Remove non-numeric characters except decimal point
    const cleaned = text.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limit to 2 decimal places
    if (parts[1] && parts[1].length > 2) {
      return parts[0] + '.' + parts[1].substring(0, 2);
    }
    
    return cleaned;
  };

  const amountNum = parseFloat(amount) || 0;
  const hasInsufficientFunds = amountNum > balanceInDollars();

  return (
    <PinGate>
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>Send Money</Text>
              <Text style={styles.balance}>
                Available: {getFormattedBalance()}
              </Text>
            </View>

            <Card style={styles.formCard}>
              <View style={styles.recipientSection}>
                <Input
                  label="Recipient Phone Number"
                  placeholder="+1 (555) 123-4567"
                  value={recipient}
                  onChangeText={setRecipient}
                  keyboardType="phone-pad"
                  autoComplete="tel"
                  rightIcon={
                    <Button
                      title="📷"
                      onPress={handleScanQR}
                      variant="ghost"
                      size="small"
                    />
                  }
                />
              </View>

              <View style={styles.amountSection}>
                <Input
                  label="Amount (USD)"
                  placeholder="0.00"
                  value={amount}
                  onChangeText={(text) => setAmount(formatAmountInput(text))}
                  keyboardType="decimal-pad"
                  error={hasInsufficientFunds ? 'Insufficient balance' : undefined}
                  rightIcon={
                    <Button
                      title="Max"
                      onPress={handleMaxAmount}
                      variant="ghost"
                      size="small"
                    />
                  }
                />
              </View>

              <Input
                label="Memo (Optional)"
                placeholder="What's this for?"
                value={memo}
                onChangeText={setMemo}
                maxLength={100}
                multiline
                numberOfLines={2}
                hint={`${memo.length}/100 characters`}
              />
            </Card>

            {amountNum > 0 && (
              <Card style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Transaction Summary</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Amount:</Text>
                  <Text style={styles.summaryValue}>${amountNum.toFixed(2)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Fee:</Text>
                  <Text style={styles.summaryValue}>$0.00</Text>
                </View>
                <View style={[styles.summaryRow, styles.summaryTotal]}>
                  <Text style={styles.summaryTotalLabel}>Total:</Text>
                  <Text style={styles.summaryTotalValue}>${amountNum.toFixed(2)}</Text>
                </View>
              </Card>
            )}

            <View style={styles.footer}>
              <Button
                title="Send Money"
                onPress={handleSend}
                loading={loading}
                disabled={loading || hasInsufficientFunds || !recipient.trim() || !amount.trim()}
                size="large"
                fullWidth
              />
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
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    ...theme.typography.heading.h1,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  balance: {
    ...theme.typography.body.medium,
    color: theme.colors.text.secondary,
  },
  formCard: {
    marginBottom: theme.spacing.lg,
  },
  recipientSection: {
    marginBottom: theme.spacing.md,
  },
  amountSection: {
    marginBottom: theme.spacing.md,
  },
  summaryCard: {
    marginBottom: theme.spacing.lg,
  },
  summaryTitle: {
    ...theme.typography.heading.h4,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  summaryLabel: {
    ...theme.typography.body.medium,
    color: theme.colors.text.secondary,
  },
  summaryValue: {
    ...theme.typography.body.medium,
    color: theme.colors.text.primary,
  },
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  summaryTotalLabel: {
    ...theme.typography.label.medium,
    color: theme.colors.text.primary,
    fontWeight: '600',
  },
  summaryTotalValue: {
    ...theme.typography.label.medium,
    color: theme.colors.text.primary,
    fontWeight: '600',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: theme.spacing.lg,
  },
});