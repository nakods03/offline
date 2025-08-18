import * as Keychain from 'react-native-keychain';
import { getRandomValues } from 'react-native-get-random-values';
import { CryptoError } from '@/types';

const ENCRYPTION_KEY_SERVICE = 'OfflineSmsWallet_EncryptionKey';
const PRIVATE_KEY_SERVICE = 'OfflineSmsWallet_PrivateKey';

// Generate a 64-byte encryption key for Realm
export const generateEncryptionKey = async (): Promise<Uint8Array> => {
  try {
    const key = new Uint8Array(64);
    getRandomValues(key);
    
    // Store in secure keychain
    await Keychain.setInternetCredentials(
      ENCRYPTION_KEY_SERVICE,
      'encryption_key',
      Array.from(key).map(b => b.toString(16).padStart(2, '0')).join(''),
      {
        accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE,
        authenticationType: Keychain.AUTHENTICATION_TYPE.DEVICE_PASSCODE_OR_BIOMETRICS,
        accessGroup: undefined,
        service: ENCRYPTION_KEY_SERVICE,
      }
    );
    
    return key;
  } catch (error) {
    throw new CryptoError('Failed to generate encryption key', error);
  }
};

// Retrieve stored encryption key
export const getStoredEncryptionKey = async (): Promise<Uint8Array | null> => {
  try {
    const credentials = await Keychain.getInternetCredentials(ENCRYPTION_KEY_SERVICE);
    
    if (credentials && credentials.password) {
      // Convert hex string back to Uint8Array
      const hexString = credentials.password;
      const key = new Uint8Array(hexString.length / 2);
      for (let i = 0; i < hexString.length; i += 2) {
        key[i / 2] = parseInt(hexString.substr(i, 2), 16);
      }
      return key;
    }
    
    return null;
  } catch (error) {
    console.warn('Failed to retrieve encryption key:', error);
    return null;
  }
};

// Store private key securely
export const storePrivateKey = async (privateKeyHex: string): Promise<void> => {
  try {
    await Keychain.setInternetCredentials(
      PRIVATE_KEY_SERVICE,
      'private_key',
      privateKeyHex,
      {
        accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE,
        authenticationType: Keychain.AUTHENTICATION_TYPE.DEVICE_PASSCODE_OR_BIOMETRICS,
        accessGroup: undefined,
        service: PRIVATE_KEY_SERVICE,
      }
    );
  } catch (error) {
    throw new CryptoError('Failed to store private key', error);
  }
};

// Retrieve private key
export const getStoredPrivateKey = async (): Promise<string | null> => {
  try {
    const credentials = await Keychain.getInternetCredentials(PRIVATE_KEY_SERVICE);
    return credentials ? credentials.password : null;
  } catch (error) {
    console.warn('Failed to retrieve private key:', error);
    return null;
  }
};

// Clear all stored keys (for wallet reset)
export const clearStoredKeys = async (): Promise<void> => {
  try {
    await Promise.all([
      Keychain.resetInternetCredentials(ENCRYPTION_KEY_SERVICE),
      Keychain.resetInternetCredentials(PRIVATE_KEY_SERVICE),
    ]);
  } catch (error) {
    console.warn('Failed to clear stored keys:', error);
  }
};