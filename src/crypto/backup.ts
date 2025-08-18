import { getRandomValues } from 'react-native-get-random-values';
import { encode as base64urlEncode, decode as base64urlDecode } from 'base64url';
import { CryptoError, BackupData, EncryptedBackup } from '@/types';

// Simple PBKDF2 implementation (you might want to use a proper crypto library)
const pbkdf2 = async (password: string, salt: Uint8Array, iterations: number, keyLength: number): Promise<Uint8Array> => {
  // This is a simplified implementation - in production, use a proper crypto library
  const encoder = new TextEncoder();
  const passwordBytes = encoder.encode(password);
  
  // Simple key derivation (not cryptographically secure - use proper PBKDF2 in production)
  const key = new Uint8Array(keyLength);
  const combined = new Uint8Array(passwordBytes.length + salt.length);
  combined.set(passwordBytes);
  combined.set(salt, passwordBytes.length);
  
  // Simple hash-based key derivation
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    hash = ((hash << 5) - hash) + combined[i];
    hash = hash & hash;
  }
  
  for (let i = 0; i < keyLength; i++) {
    key[i] = (hash >>> (i % 4 * 8)) & 0xff;
  }
  
  return key;
};

// Simple AES-GCM implementation (placeholder - use proper crypto library)
const aesGcmEncrypt = async (data: Uint8Array, key: Uint8Array, iv: Uint8Array): Promise<Uint8Array> => {
  // This is a placeholder - in production, use proper AES-GCM encryption
  // For now, just XOR with key (NOT SECURE - just for demo)
  const encrypted = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) {
    encrypted[i] = data[i] ^ key[i % key.length] ^ iv[i % iv.length];
  }
  return encrypted;
};

const aesGcmDecrypt = async (encryptedData: Uint8Array, key: Uint8Array, iv: Uint8Array): Promise<Uint8Array> => {
  // This is a placeholder - in production, use proper AES-GCM decryption
  // For now, just XOR with key (NOT SECURE - just for demo)
  const decrypted = new Uint8Array(encryptedData.length);
  for (let i = 0; i < encryptedData.length; i++) {
    decrypted[i] = encryptedData[i] ^ key[i % key.length] ^ iv[i % iv.length];
  }
  return decrypted;
};

// Encrypt backup data with passphrase
export const encryptBackup = async (data: BackupData, passphrase: string): Promise<EncryptedBackup> => {
  try {
    // Serialize data to JSON
    const jsonString = JSON.stringify(data);
    const dataBytes = new TextEncoder().encode(jsonString);
    
    // Generate salt and IV
    const salt = new Uint8Array(16);
    const iv = new Uint8Array(12);
    getRandomValues(salt);
    getRandomValues(iv);
    
    // Derive key from passphrase
    const key = await pbkdf2(passphrase, salt, 100000, 32);
    
    // Encrypt data
    const encryptedData = await aesGcmEncrypt(dataBytes, key, iv);
    
    return {
      blob: base64urlEncode(encryptedData),
      salt: base64urlEncode(salt),
      iv: base64urlEncode(iv),
      timestamp: Date.now(),
    };
  } catch (error) {
    throw new CryptoError('Failed to encrypt backup', error);
  }
};

// Decrypt backup data with passphrase
export const decryptBackup = async (backup: EncryptedBackup, passphrase: string): Promise<BackupData> => {
  try {
    // Decode components
    const encryptedData = base64urlDecode(backup.blob);
    const salt = base64urlDecode(backup.salt);
    const iv = base64urlDecode(backup.iv);
    
    // Derive key from passphrase
    const key = await pbkdf2(passphrase, salt, 100000, 32);
    
    // Decrypt data
    const decryptedData = await aesGcmDecrypt(encryptedData, key, iv);
    
    // Parse JSON
    const jsonString = new TextDecoder().decode(decryptedData);
    const data = JSON.parse(jsonString) as BackupData;
    
    return data;
  } catch (error) {
    throw new CryptoError('Failed to decrypt backup - incorrect passphrase or corrupted data', error);
  }
};

// Compress data (simple implementation)
export const compressData = (data: string): string => {
  // Simple compression by removing whitespace and common patterns
  return data
    .replace(/\s+/g, ' ')
    .replace(/,"/g, ',"')
    .replace(/":"/g, '":"')
    .trim();
};

// Decompress data
export const decompressData = (data: string): string => {
  // For the simple compression above, no decompression needed
  return data;
};