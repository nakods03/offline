import Realm from 'realm';
import { AllSchemas } from './models';
import { generateEncryptionKey, getStoredEncryptionKey } from '@/crypto/keystore';

const SCHEMA_VERSION = 1;

let realmInstance: Realm | null = null;

export const initializeRealm = async (): Promise<Realm> => {
  if (realmInstance) {
    return realmInstance;
  }

  try {
    // Get or generate encryption key from secure storage
    let encryptionKey = await getStoredEncryptionKey();
    if (!encryptionKey) {
      encryptionKey = await generateEncryptionKey();
    }

    const config: Realm.Configuration = {
      schema: AllSchemas,
      schemaVersion: SCHEMA_VERSION,
      encryptionKey: encryptionKey,
      migration: (oldRealm, newRealm) => {
        // Handle migrations here if needed
        console.log('Migrating Realm from version', oldRealm.schemaVersion, 'to', newRealm.schemaVersion);
      },
    };

    realmInstance = await Realm.open(config);
    return realmInstance;
  } catch (error) {
    console.error('Failed to initialize Realm:', error);
    throw error;
  }
};

export const getRealm = (): Realm => {
  if (!realmInstance) {
    throw new Error('Realm not initialized. Call initializeRealm() first.');
  }
  return realmInstance;
};

export const closeRealm = (): void => {
  if (realmInstance && !realmInstance.isClosed) {
    realmInstance.close();
    realmInstance = null;
  }
};

// Database utility functions
export const dbWrite = <T>(callback: () => T): T => {
  const realm = getRealm();
  let result: T;
  
  realm.write(() => {
    result = callback();
  });
  
  return result!;
};

export const dbRead = <T>(callback: () => T): T => {
  const realm = getRealm();
  return callback();
};

// Clean up old nonces (older than 24 hours)
export const cleanupOldNonces = (): void => {
  const realm = getRealm();
  const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
  
  realm.write(() => {
    const oldNonces = realm.objects('NonceCache').filtered('timestamp < $0', oneDayAgo);
    realm.delete(oldNonces);
  });
};

// Initialize default data
export const initializeDefaultData = async (): Promise<void> => {
  const realm = getRealm();
  
  realm.write(() => {
    // Create default wallet if it doesn't exist
    const existingWallet = realm.objectForPrimaryKey('Wallet', 'default');
    if (!existingWallet) {
      realm.create('Wallet', {
        id: 'default',
        balanceCents: 0,
        updatedAt: new Date(),
      });
    }

    // Create default settings if they don't exist
    const existingSettings = realm.objectForPrimaryKey('Settings', 'default');
    if (!existingSettings) {
      realm.create('Settings', {
        id: 'default',
        autoLockMs: 30000, // 30 seconds
        cloudEnabled: false,
        updatedAt: new Date(),
      });
    }
  });
};