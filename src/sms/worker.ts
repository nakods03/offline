import { smsBridge } from './bridge';
import { getRealm } from '@/db/realm';
import { TransactionSchema } from '@/db/models';
import { SmsError } from '@/types';

export interface RetryConfig {
  maxRetries: number;
  retryDelayMs: number;
  backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  retryDelayMs: 5000, // 5 seconds
  backoffMultiplier: 2,
};

export class SmsRetryWorker {
  private static instance: SmsRetryWorker;
  private retryTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private config: RetryConfig;

  static getInstance(config?: RetryConfig): SmsRetryWorker {
    if (!SmsRetryWorker.instance) {
      SmsRetryWorker.instance = new SmsRetryWorker(config);
    }
    return SmsRetryWorker.instance;
  }

  private constructor(config?: RetryConfig) {
    this.config = { ...DEFAULT_RETRY_CONFIG, ...config };
    this.setupRetryListener();
  }

  private setupRetryListener(): void {
    smsBridge.onRetry((event) => {
      console.log('Retry worker started:', event);
      this.retryFailedTransactions();
    });
  }

  // Schedule retry for a specific transaction
  scheduleRetry(txid: string, currentRetries: number = 0): void {
    // Clear existing timeout if any
    this.cancelRetry(txid);

    if (currentRetries >= this.config.maxRetries) {
      console.log(`Max retries reached for transaction ${txid}`);
      this.markTransactionAsPermanentlyFailed(txid);
      return;
    }

    // Calculate delay with exponential backoff
    const delay = this.config.retryDelayMs * Math.pow(this.config.backoffMultiplier, currentRetries);

    console.log(`Scheduling retry for ${txid} in ${delay}ms (attempt ${currentRetries + 1})`);

    const timeout = setTimeout(() => {
      this.retryTransaction(txid, currentRetries + 1);
    }, delay);

    this.retryTimeouts.set(txid, timeout);
  }

  // Cancel retry for a specific transaction
  cancelRetry(txid: string): void {
    const timeout = this.retryTimeouts.get(txid);
    if (timeout) {
      clearTimeout(timeout);
      this.retryTimeouts.delete(txid);
    }
  }

  // Retry a specific transaction
  private async retryTransaction(txid: string, retryCount: number): Promise<void> {
    try {
      const realm = getRealm();
      const transaction = realm.objectForPrimaryKey('Transaction', txid) as TransactionSchema;

      if (!transaction) {
        console.warn(`Transaction ${txid} not found for retry`);
        return;
      }

      if (transaction.status !== 'FAILED_TEMP') {
        console.log(`Transaction ${txid} no longer needs retry (status: ${transaction.status})`);
        return;
      }

      console.log(`Retrying transaction ${txid} (attempt ${retryCount})`);

      // Update retry count
      realm.write(() => {
        if (transaction.deliveryMeta) {
          transaction.deliveryMeta.retries = retryCount;
        } else {
          // Create delivery meta if it doesn't exist
          transaction.deliveryMeta = realm.create('DeliveryMeta', {
            retries: retryCount,
          });
        }
        transaction.status = 'SENDING';
        transaction.updatedAt = new Date();
      });

      // Attempt to resend SMS
      await smsBridge.sendSms(transaction.counterpartyPhone, transaction.raw, txid);

    } catch (error) {
      console.error(`Failed to retry transaction ${txid}:`, error);
      
      // Schedule another retry if we haven't exceeded max retries
      if (retryCount < this.config.maxRetries) {
        this.scheduleRetry(txid, retryCount);
      } else {
        this.markTransactionAsPermanentlyFailed(txid);
      }
    }
  }

  // Mark transaction as permanently failed
  private markTransactionAsPermanentlyFailed(txid: string): void {
    try {
      const realm = getRealm();
      const transaction = realm.objectForPrimaryKey('Transaction', txid) as TransactionSchema;

      if (transaction) {
        realm.write(() => {
          transaction.status = 'FAILED_PERM';
          transaction.updatedAt = new Date();
        });
      }
    } catch (error) {
      console.error(`Failed to mark transaction ${txid} as permanently failed:`, error);
    }
  }

  // Retry all failed transactions on startup
  retryFailedTransactions(): void {
    try {
      const realm = getRealm();
      const failedTransactions = realm.objects('Transaction')
        .filtered('status = "FAILED_TEMP"') as Realm.Results<TransactionSchema>;

      console.log(`Found ${failedTransactions.length} failed transactions to retry`);

      failedTransactions.forEach((transaction) => {
        const retries = transaction.deliveryMeta?.retries || 0;
        if (retries < this.config.maxRetries) {
          // Add some jitter to avoid thundering herd
          const jitter = Math.random() * 2000; // 0-2 seconds
          setTimeout(() => {
            this.scheduleRetry(transaction.id, retries);
          }, jitter);
        } else {
          this.markTransactionAsPermanentlyFailed(transaction.id);
        }
      });
    } catch (error) {
      console.error('Failed to retry failed transactions:', error);
    }
  }

  // Clean up all timeouts
  cleanup(): void {
    this.retryTimeouts.forEach((timeout) => {
      clearTimeout(timeout);
    });
    this.retryTimeouts.clear();
  }
}

// Singleton instance
export const smsRetryWorker = SmsRetryWorker.getInstance();