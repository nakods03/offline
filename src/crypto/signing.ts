import nacl from 'tweetnacl';
import { encode as base64urlEncode, decode as base64urlDecode } from 'base64url';
import { getRandomValues } from 'react-native-get-random-values';
import { CryptoError } from '@/types';

// Generate Ed25519 keypair
export const generateKeyPair = (): { publicKey: string; privateKey: string } => {
  try {
    const keyPair = nacl.sign.keyPair();
    
    return {
      publicKey: base64urlEncode(keyPair.publicKey),
      privateKey: Array.from(keyPair.secretKey).map(b => b.toString(16).padStart(2, '0')).join(''),
    };
  } catch (error) {
    throw new CryptoError('Failed to generate keypair', error);
  }
};

// Sign a payload with private key
export const signPayload = (payload: string, privateKeyHex: string): string => {
  try {
    // Convert hex private key back to Uint8Array
    const privateKeyBytes = new Uint8Array(privateKeyHex.length / 2);
    for (let i = 0; i < privateKeyHex.length; i += 2) {
      privateKeyBytes[i / 2] = parseInt(privateKeyHex.substr(i, 2), 16);
    }
    
    // Sign the payload
    const message = new TextEncoder().encode(payload);
    const signature = nacl.sign.detached(message, privateKeyBytes);
    
    return base64urlEncode(signature);
  } catch (error) {
    throw new CryptoError('Failed to sign payload', error);
  }
};

// Verify signature with public key
export const verifySignature = (payload: string, signatureB64: string, publicKeyB64: string): boolean => {
  try {
    const message = new TextEncoder().encode(payload);
    const signature = base64urlDecode(signatureB64);
    const publicKey = base64urlDecode(publicKeyB64);
    
    return nacl.sign.detached.verify(message, signature, publicKey);
  } catch (error) {
    console.warn('Failed to verify signature:', error);
    return false;
  }
};

// Generate random nonce
export const generateNonce = (length: number = 8): string => {
  const bytes = new Uint8Array(length / 2);
  getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
};

// Generate UUID v4 (simplified)
export const generateTxId = (): string => {
  const bytes = new Uint8Array(16);
  getRandomValues(bytes);
  
  // Set version (4) and variant bits
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  
  const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Format as UUID (remove dashes for SMS space efficiency)
  return hex;
};

// Validate timestamp (within ±15 minutes)
export const isTimestampValid = (timestamp: number, windowMs: number = 15 * 60 * 1000): boolean => {
  const now = Date.now();
  const diff = Math.abs(now - timestamp);
  return diff <= windowMs;
};

// Hash function for deterministic IDs
export const hashString = (input: string): string => {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
};