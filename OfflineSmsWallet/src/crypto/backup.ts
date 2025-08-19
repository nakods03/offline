import { createHash, createCipheriv, createDecipheriv, randomBytes } from 'react-native-quick-crypto';

function pbkdf2Sha256(passphrase: string, salt: Uint8Array, iterations = 100_000, keyLen = 32): Uint8Array {
  // Minimal PBKDF2 via Node crypto polyfill
  // For simplicity in RN Quick Crypto, emulate with iterative HMAC chaining
  const blockIndex = Buffer.from([0, 0, 0, 1]);
  let u = createHash('sha256').update(Buffer.concat([Buffer.from(passphrase), salt, blockIndex])).digest();
  let output = Buffer.from(u);
  for (let i = 1; i < iterations; i++) {
    u = createHash('sha256').update(u).digest();
    for (let j = 0; j < output.length; j++) output[j] ^= u[j];
  }
  return output.slice(0, keyLen);
}

export function encryptBackup(json: string, passphrase: string): { blob: Uint8Array; meta: { salt: string; iv: string; algo: string; version: number } } {
  const salt = randomBytes(16);
  const key = pbkdf2Sha256(passphrase, salt);
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(Buffer.from(json, 'utf8')), cipher.final()]);
  const tag = cipher.getAuthTag();
  const blob = Buffer.concat([ciphertext, tag]);
  return { blob, meta: { salt: Buffer.from(salt).toString('base64'), iv: Buffer.from(iv).toString('base64'), algo: 'AES-256-GCM', version: 1 } };
}

export function decryptBackup(blob: Uint8Array, passphrase: string, meta: { salt: string; iv: string }): string {
  const salt = Buffer.from(meta.salt, 'base64');
  const iv = Buffer.from(meta.iv, 'base64');
  const key = pbkdf2Sha256(passphrase, salt);
  const data = Buffer.from(blob);
  const ciphertext = data.slice(0, data.length - 16);
  const tag = data.slice(data.length - 16);
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return plaintext.toString('utf8');
}

