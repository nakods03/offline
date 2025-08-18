import { create } from 'zustand';
import { AppState, AppStateStatus } from 'react-native';
import { PinState } from '@/types';
import { getRealm } from '@/db/realm';
import { SettingsSchema } from '@/db/models';

interface AuthState extends PinState {
  // Actions
  setPin: (pin: string) => Promise<void>;
  verifyPin: (pin: string) => Promise<boolean>;
  lock: () => void;
  unlock: () => void;
  updateActivity: () => void;
  setAutoLockTimeout: (ms: number) => void;
  
  // Internal
  pinHash: string | null;
  lockTimer: NodeJS.Timeout | null;
  appStateListener: any;
}

// Simple hash function for PIN (use proper hashing in production)
const hashPin = (pin: string): string => {
  let hash = 0;
  for (let i = 0; i < pin.length; i++) {
    const char = pin.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
};

export const useAuthStore = create<AuthState>((set, get) => {
  let lockTimer: NodeJS.Timeout | null = null;

  const startLockTimer = () => {
    const state = get();
    if (lockTimer) {
      clearTimeout(lockTimer);
    }

    if (!state.isLocked && state.hasPin && state.autoLockMs > 0) {
      lockTimer = setTimeout(() => {
        set({ isLocked: true });
        // Update last lock time in database
        try {
          const realm = getRealm();
          const settings = realm.objectForPrimaryKey('Settings', 'default') as SettingsSchema;
          if (settings) {
            realm.write(() => {
              settings.lastLockAt = new Date();
            });
          }
        } catch (error) {
          console.error('Failed to update last lock time:', error);
        }
      }, state.autoLockMs);
    }
  };

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    const state = get();
    
    if (nextAppState === 'background' || nextAppState === 'inactive') {
      // App going to background - start lock timer
      if (!state.isLocked && state.hasPin) {
        startLockTimer();
      }
    } else if (nextAppState === 'active') {
      // App becoming active - check if should be locked
      const now = Date.now();
      const timeSinceLastActivity = now - state.lastActivity;
      
      if (timeSinceLastActivity > state.autoLockMs && state.hasPin) {
        set({ isLocked: true });
      } else {
        // Update activity and restart timer
        set({ lastActivity: now });
        startLockTimer();
      }
    }
  };

  // Set up app state listener
  const appStateListener = AppState.addEventListener('change', handleAppStateChange);

  return {
    // Initial state
    isLocked: false,
    hasPin: false,
    lastActivity: Date.now(),
    autoLockMs: 30000, // 30 seconds default
    pinHash: null,
    lockTimer: null,
    appStateListener,

    // Actions
    setPin: async (pin: string) => {
      try {
        const hash = hashPin(pin);
        
        // Store PIN hash in secure storage (in production, use proper secure storage)
        const realm = getRealm();
        realm.write(() => {
          // Create or update encrypted key entry for PIN
          realm.create('EncryptedKey', {
            id: 'pin_hash',
            encryptedPrivateKey: hash,
            iv: 'pin',
            createdAt: new Date(),
          }, 'modified');
        });

        set({ 
          hasPin: true, 
          pinHash: hash,
          isLocked: false,
          lastActivity: Date.now()
        });

        startLockTimer();
      } catch (error) {
        console.error('Failed to set PIN:', error);
        throw error;
      }
    },

    verifyPin: async (pin: string) => {
      const state = get();
      const inputHash = hashPin(pin);
      
      // If no stored hash, try to load from database
      let storedHash = state.pinHash;
      if (!storedHash) {
        try {
          const realm = getRealm();
          const pinEntry = realm.objectForPrimaryKey('EncryptedKey', 'pin_hash');
          if (pinEntry) {
            storedHash = pinEntry.encryptedPrivateKey;
            set({ pinHash: storedHash });
          }
        } catch (error) {
          console.error('Failed to load PIN hash:', error);
          return false;
        }
      }

      const isValid = storedHash === inputHash;
      
      if (isValid) {
        set({ 
          isLocked: false, 
          lastActivity: Date.now() 
        });
        startLockTimer();
      }

      return isValid;
    },

    lock: () => {
      set({ isLocked: true });
      if (lockTimer) {
        clearTimeout(lockTimer);
        lockTimer = null;
      }
    },

    unlock: () => {
      set({ 
        isLocked: false, 
        lastActivity: Date.now() 
      });
      startLockTimer();
    },

    updateActivity: () => {
      const now = Date.now();
      set({ lastActivity: now });
      startLockTimer();
    },

    setAutoLockTimeout: (ms: number) => {
      set({ autoLockMs: ms });
      
      // Update in database
      try {
        const realm = getRealm();
        const settings = realm.objectForPrimaryKey('Settings', 'default') as SettingsSchema;
        if (settings) {
          realm.write(() => {
            settings.autoLockMs = ms;
          });
        }
      } catch (error) {
        console.error('Failed to update auto-lock timeout:', error);
      }

      // Restart timer with new timeout
      startLockTimer();
    },
  };
});

// Initialize auth state from database
export const initializeAuthStore = async () => {
  try {
    const realm = getRealm();
    
    // Load settings
    const settings = realm.objectForPrimaryKey('Settings', 'default') as SettingsSchema;
    if (settings) {
      useAuthStore.setState({ 
        autoLockMs: settings.autoLockMs,
      });
    }

    // Check if PIN exists
    const pinEntry = realm.objectForPrimaryKey('EncryptedKey', 'pin_hash');
    if (pinEntry) {
      useAuthStore.setState({ 
        hasPin: true,
        pinHash: pinEntry.encryptedPrivateKey,
        isLocked: true, // Start locked if PIN exists
      });
    }
  } catch (error) {
    console.error('Failed to initialize auth store:', error);
  }
};