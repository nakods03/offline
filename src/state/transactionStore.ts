import { create } from 'zustand';
import { Transaction, DraftTransaction, FilterType, ParsedTransaction, UserProfile } from '@/types';
import { getRealm, dbWrite, dbRead } from '@/db/realm';
import { TransactionSchema, ContactSchema, UserProfileSchema } from '@/db/models';
import { buildSmsPayload, parseSmsPayload, validateTransaction, isNonceUsed, storeNonce } from '@/sms/protocol';
import { verifySignature } from '@/crypto/signing';
import { getStoredPrivateKey } from '@/crypto/keystore';
import { smsBridge } from '@/sms/bridge';
import { smsRetryWorker } from '@/sms/worker';
import { useWalletStore } from './walletStore';

interface TransactionState {
  // State
  transactions: Transaction[];
  filter: FilterType;
  loading: boolean;
  
  // Actions
  loadTransactions: () => Promise<void>;
  setFilter: (filter: FilterType) => void;
  sendTransaction: (draft: DraftTransaction) => Promise<string>; // returns txid
  processIncomingTransaction: (smsText: string, senderPhone: string) => Promise<void>;
  updateTransactionStatus: (txid: string, status: string, deliveryMeta?: any) => void;
  getTransaction: (txid: string) => Transaction | null;
  
  // Computed
  getFilteredTransactions: () => Transaction[];
  getPendingTransactions: () => Transaction[];
  getRecentTransactions: (limit?: number) => Transaction[];
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  // Initial state
  transactions: [],
  filter: 'ALL',
  loading: false,

  // Actions
  loadTransactions: async () => {
    try {
      set({ loading: true });
      
      const transactions = dbRead(() => {
        const realm = getRealm();
        const results = realm.objects('Transaction')
          .sorted('createdAt', true) as Realm.Results<TransactionSchema>;
        
        return Array.from(results).map(tx => ({
          id: tx.id,
          direction: tx.direction as 'SENT' | 'RECEIVED',
          counterpartyPhone: tx.counterpartyPhone,
          amountCents: tx.amountCents,
          memo: tx.memo,
          timestamp: tx.timestamp,
          nonce: tx.nonce,
          status: tx.status as any,
          raw: tx.raw,
          signatureB64: tx.signatureB64,
          deliveryMeta: tx.deliveryMeta ? {
            smsId: tx.deliveryMeta.smsId,
            errorCode: tx.deliveryMeta.errorCode,
            retries: tx.deliveryMeta.retries,
          } : undefined,
          verified: tx.verified,
          createdAt: tx.createdAt,
          updatedAt: tx.updatedAt,
        } as Transaction));
      });

      set({ transactions, loading: false });
    } catch (error) {
      console.error('Failed to load transactions:', error);
      set({ loading: false });
      throw error;
    }
  },

  setFilter: (filter: FilterType) => {
    set({ filter });
  },

  sendTransaction: async (draft: DraftTransaction) => {
    try {
      // Get user profile and private key
      const userProfile = dbRead(() => {
        const realm = getRealm();
        return realm.objects('UserProfile')[0] as UserProfileSchema;
      });

      if (!userProfile) {
        throw new Error('User profile not found');
      }

      const privateKeyHex = await getStoredPrivateKey();
      if (!privateKeyHex) {
        throw new Error('Private key not found');
      }

      // Build SMS payload
      const { text, txid, signedPayload } = buildSmsPayload(draft, {
        id: userProfile.id,
        phoneE164: userProfile.phoneE164,
        deviceId: userProfile.deviceId,
        publicKeyB64: userProfile.publicKeyB64,
        createdAt: userProfile.createdAt,
      }, privateKeyHex);

      // Create transaction record
      const transaction: Transaction = {
        id: txid,
        direction: 'SENT',
        counterpartyPhone: draft.to,
        amountCents: draft.amountCents,
        memo: draft.memo,
        timestamp: Date.now(),
        nonce: '', // Will be extracted from payload
        status: 'SENDING',
        raw: text,
        signatureB64: '', // Will be extracted from payload
        deliveryMeta: {
          retries: 0,
        },
        verified: true, // Our own transactions are verified
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Extract nonce and signature from payload for storage
      const parsed = parseSmsPayload(text);
      transaction.nonce = parsed.nonce;
      transaction.signatureB64 = parsed.signature;

      // Save to database
      dbWrite(() => {
        const realm = getRealm();
        realm.create('Transaction', {
          id: transaction.id,
          direction: transaction.direction,
          counterpartyPhone: transaction.counterpartyPhone,
          amountCents: transaction.amountCents,
          memo: transaction.memo,
          timestamp: transaction.timestamp,
          nonce: transaction.nonce,
          status: transaction.status,
          raw: transaction.raw,
          signatureB64: transaction.signatureB64,
          deliveryMeta: realm.create('DeliveryMeta', {
            retries: 0,
          }),
          verified: transaction.verified,
          createdAt: transaction.createdAt,
          updatedAt: transaction.updatedAt,
        });
      });

      // Update local state
      set(state => ({
        transactions: [transaction, ...state.transactions],
      }));

      // Set up event listeners for this transaction
      const unsubscribeSent = smsBridge.onSmsSent(txid, (event) => {
        get().updateTransactionStatus(txid, event.status, {
          errorCode: event.errorCode,
        });
        
        if (event.status === 'SENT') {
          // Debit wallet immediately on successful send
          const walletStore = useWalletStore.getState();
          walletStore.debit(draft.amountCents);
        } else if (event.status.startsWith('FAILED')) {
          // Schedule retry for temporary failures
          if (event.status === 'FAILED_TEMP') {
            smsRetryWorker.scheduleRetry(txid);
          }
        }
        
        unsubscribeSent();
      });

      const unsubscribeDelivered = smsBridge.onSmsDelivered(txid, (event) => {
        get().updateTransactionStatus(txid, event.status);
        unsubscribeDelivered();
      });

      // Send SMS
      await smsBridge.sendSms(draft.to, text, txid);

      return txid;
    } catch (error) {
      console.error('Failed to send transaction:', error);
      throw error;
    }
  },

  processIncomingTransaction: async (smsText: string, senderPhone: string) => {
    try {
      // Parse SMS payload
      const parsed = parseSmsPayload(smsText);
      
      // Get user profile to validate transaction
      const userProfile = dbRead(() => {
        const realm = getRealm();
        return realm.objects('UserProfile')[0] as UserProfileSchema;
      });

      if (!userProfile) {
        throw new Error('User profile not found');
      }

      // Validate transaction
      validateTransaction(parsed, userProfile.phoneE164);

      // Check for replay attack
      const realm = getRealm();
      if (isNonceUsed(parsed.nonce, parsed.txid, realm)) {
        console.warn('Duplicate nonce detected, ignoring transaction');
        return;
      }

      // Check if transaction already exists
      const existingTx = realm.objectForPrimaryKey('Transaction', parsed.txid);
      if (existingTx) {
        console.warn('Transaction already exists, ignoring');
        return;
      }

      // Get sender contact for signature verification
      const senderContact = dbRead(() => {
        return realm.objectForPrimaryKey('Contact', senderPhone) as ContactSchema;
      });

      let verified = false;
      let status: 'VERIFIED' | 'UNVERIFIED' = 'UNVERIFIED';

      if (senderContact && senderContact.trusted) {
        // Verify signature
        const signatureValid = verifySignature(
          parsed.raw.substring(0, parsed.raw.lastIndexOf('|sig:')),
          parsed.signature,
          senderContact.publicKeyB64
        );
        
        if (signatureValid) {
          verified = true;
          status = 'VERIFIED';
        }
      }

      // Create transaction record
      const transaction: Transaction = {
        id: parsed.txid,
        direction: 'RECEIVED',
        counterpartyPhone: parsed.from,
        amountCents: Math.round(parsed.amount * 100),
        memo: parsed.memo,
        timestamp: parsed.timestamp,
        nonce: parsed.nonce,
        status: status,
        raw: parsed.raw,
        signatureB64: parsed.signature,
        verified,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Save transaction and nonce
      dbWrite(() => {
        realm.create('Transaction', {
          id: transaction.id,
          direction: transaction.direction,
          counterpartyPhone: transaction.counterpartyPhone,
          amountCents: transaction.amountCents,
          memo: transaction.memo,
          timestamp: transaction.timestamp,
          nonce: transaction.nonce,
          status: transaction.status,
          raw: transaction.raw,
          signatureB64: transaction.signatureB64,
          verified: transaction.verified,
          createdAt: transaction.createdAt,
          updatedAt: transaction.updatedAt,
        });

        // Store nonce for replay protection
        storeNonce(parsed.nonce, parsed.txid, parsed.timestamp, realm);
      });

      // Update local state
      set(state => ({
        transactions: [transaction, ...state.transactions],
      }));

      // Credit wallet if verified
      if (verified) {
        const walletStore = useWalletStore.getState();
        walletStore.credit(transaction.amountCents);
        
        // Update transaction status to APPLIED
        get().updateTransactionStatus(parsed.txid, 'APPLIED');
      }

    } catch (error) {
      console.error('Failed to process incoming transaction:', error);
      // Don't throw - we don't want to crash on malformed SMS
    }
  },

  updateTransactionStatus: (txid: string, status: string, deliveryMeta?: any) => {
    try {
      // Update database
      dbWrite(() => {
        const realm = getRealm();
        const transaction = realm.objectForPrimaryKey('Transaction', txid) as TransactionSchema;
        if (transaction) {
          transaction.status = status;
          transaction.updatedAt = new Date();
          
          if (deliveryMeta && transaction.deliveryMeta) {
            if (deliveryMeta.errorCode !== undefined) {
              transaction.deliveryMeta.errorCode = deliveryMeta.errorCode;
            }
            if (deliveryMeta.retries !== undefined) {
              transaction.deliveryMeta.retries = deliveryMeta.retries;
            }
          }
        }
      });

      // Update local state
      set(state => ({
        transactions: state.transactions.map(tx =>
          tx.id === txid
            ? { 
                ...tx, 
                status: status as any,
                deliveryMeta: deliveryMeta ? { ...tx.deliveryMeta, ...deliveryMeta } : tx.deliveryMeta,
                updatedAt: new Date()
              }
            : tx
        ),
      }));
    } catch (error) {
      console.error('Failed to update transaction status:', error);
    }
  },

  getTransaction: (txid: string) => {
    return get().transactions.find(tx => tx.id === txid) || null;
  },

  // Computed
  getFilteredTransactions: () => {
    const { transactions, filter } = get();
    
    switch (filter) {
      case 'SENT':
        return transactions.filter(tx => tx.direction === 'SENT');
      case 'RECEIVED':
        return transactions.filter(tx => tx.direction === 'RECEIVED');
      case 'PENDING':
        return transactions.filter(tx => 
          ['SENDING', 'SENT', 'INCOMING', 'VERIFIED'].includes(tx.status)
        );
      default:
        return transactions;
    }
  },

  getPendingTransactions: () => {
    return get().transactions.filter(tx => 
      ['SENDING', 'SENT', 'INCOMING', 'VERIFIED'].includes(tx.status)
    );
  },

  getRecentTransactions: (limit = 10) => {
    return get().transactions.slice(0, limit);
  },
}));

// Initialize transaction store
export const initializeTransactionStore = async () => {
  try {
    await useTransactionStore.getState().loadTransactions();
    
    // Set up incoming SMS listener
    smsBridge.onIncomingSms((event) => {
      useTransactionStore.getState().processIncomingTransaction(event.raw, event.senderPhone);
    });
  } catch (error) {
    console.error('Failed to initialize transaction store:', error);
  }
};