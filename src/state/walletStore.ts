import { create } from 'zustand';
import { Wallet } from '@/types';
import { getRealm, dbWrite, dbRead } from '@/db/realm';
import { WalletSchema } from '@/db/models';

interface WalletState {
  // State
  balance: number; // in cents
  lastUpdated: Date | null;
  
  // Actions
  loadWallet: () => Promise<void>;
  updateBalance: (newBalanceCents: number) => void;
  credit: (amountCents: number) => void;
  debit: (amountCents: number) => boolean; // returns false if insufficient funds
  getFormattedBalance: () => string;
  
  // Computed
  balanceInDollars: () => number;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  // Initial state
  balance: 0,
  lastUpdated: null,

  // Actions
  loadWallet: async () => {
    try {
      const wallet = dbRead(() => {
        const realm = getRealm();
        return realm.objectForPrimaryKey('Wallet', 'default') as WalletSchema;
      });

      if (wallet) {
        set({
          balance: wallet.balanceCents,
          lastUpdated: wallet.updatedAt,
        });
      } else {
        // Create default wallet
        dbWrite(() => {
          const realm = getRealm();
          realm.create('Wallet', {
            id: 'default',
            balanceCents: 0,
            updatedAt: new Date(),
          });
        });
        
        set({
          balance: 0,
          lastUpdated: new Date(),
        });
      }
    } catch (error) {
      console.error('Failed to load wallet:', error);
      throw error;
    }
  },

  updateBalance: (newBalanceCents: number) => {
    try {
      const now = new Date();
      
      dbWrite(() => {
        const realm = getRealm();
        const wallet = realm.objectForPrimaryKey('Wallet', 'default') as WalletSchema;
        if (wallet) {
          wallet.balanceCents = newBalanceCents;
          wallet.updatedAt = now;
        }
      });

      set({
        balance: newBalanceCents,
        lastUpdated: now,
      });
    } catch (error) {
      console.error('Failed to update balance:', error);
      throw error;
    }
  },

  credit: (amountCents: number) => {
    const currentBalance = get().balance;
    const newBalance = currentBalance + amountCents;
    get().updateBalance(newBalance);
  },

  debit: (amountCents: number) => {
    const currentBalance = get().balance;
    
    if (currentBalance < amountCents) {
      return false; // Insufficient funds
    }
    
    const newBalance = currentBalance - amountCents;
    get().updateBalance(newBalance);
    return true;
  },

  getFormattedBalance: () => {
    const balance = get().balance;
    const dollars = balance / 100;
    return dollars.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  },

  balanceInDollars: () => {
    return get().balance / 100;
  },
}));

// Initialize wallet store
export const initializeWalletStore = async () => {
  try {
    await useWalletStore.getState().loadWallet();
  } catch (error) {
    console.error('Failed to initialize wallet store:', error);
  }
};