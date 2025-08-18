import { generateKeyPair, signPayload, verifySignature, generateNonce, generateTxId, isTimestampValid } from '../src/crypto/signing';

describe('Crypto Functions', () => {
  describe('generateKeyPair', () => {
    it('should generate a valid keypair', () => {
      const { publicKey, privateKey } = generateKeyPair();
      
      expect(publicKey).toBeDefined();
      expect(privateKey).toBeDefined();
      expect(typeof publicKey).toBe('string');
      expect(typeof privateKey).toBe('string');
      expect(publicKey.length).toBeGreaterThan(32);
      expect(privateKey.length).toBeGreaterThan(64);
    });

    it('should generate different keypairs each time', () => {
      const keypair1 = generateKeyPair();
      const keypair2 = generateKeyPair();
      
      expect(keypair1.publicKey).not.toBe(keypair2.publicKey);
      expect(keypair1.privateKey).not.toBe(keypair2.privateKey);
    });
  });

  describe('signPayload and verifySignature', () => {
    it('should sign and verify a payload correctly', () => {
      const { publicKey, privateKey } = generateKeyPair();
      const payload = 'test payload';
      
      const signature = signPayload(payload, privateKey);
      expect(signature).toBeDefined();
      expect(typeof signature).toBe('string');
      
      const isValid = verifySignature(payload, signature, publicKey);
      expect(isValid).toBe(true);
    });

    it('should reject invalid signatures', () => {
      const { publicKey, privateKey } = generateKeyPair();
      const payload = 'test payload';
      const wrongPayload = 'wrong payload';
      
      const signature = signPayload(payload, privateKey);
      
      // Wrong payload should fail verification
      const isValid = verifySignature(wrongPayload, signature, publicKey);
      expect(isValid).toBe(false);
    });

    it('should reject signatures with wrong public key', () => {
      const keypair1 = generateKeyPair();
      const keypair2 = generateKeyPair();
      const payload = 'test payload';
      
      const signature = signPayload(payload, keypair1.privateKey);
      
      // Wrong public key should fail verification
      const isValid = verifySignature(payload, signature, keypair2.publicKey);
      expect(isValid).toBe(false);
    });
  });

  describe('generateNonce', () => {
    it('should generate a hex nonce of specified length', () => {
      const nonce8 = generateNonce(8);
      const nonce16 = generateNonce(16);
      
      expect(nonce8).toMatch(/^[0-9a-f]{8}$/);
      expect(nonce16).toMatch(/^[0-9a-f]{16}$/);
    });

    it('should generate different nonces each time', () => {
      const nonce1 = generateNonce(8);
      const nonce2 = generateNonce(8);
      
      expect(nonce1).not.toBe(nonce2);
    });
  });

  describe('generateTxId', () => {
    it('should generate a valid transaction ID', () => {
      const txid = generateTxId();
      
      expect(txid).toBeDefined();
      expect(typeof txid).toBe('string');
      expect(txid.length).toBe(32); // 16 bytes as hex
      expect(txid).toMatch(/^[0-9a-f]{32}$/);
    });

    it('should generate different transaction IDs each time', () => {
      const txid1 = generateTxId();
      const txid2 = generateTxId();
      
      expect(txid1).not.toBe(txid2);
    });
  });

  describe('isTimestampValid', () => {
    it('should accept current timestamp', () => {
      const now = Date.now();
      expect(isTimestampValid(now)).toBe(true);
    });

    it('should accept timestamp within window', () => {
      const now = Date.now();
      const tenMinutesAgo = now - (10 * 60 * 1000);
      const tenMinutesFromNow = now + (10 * 60 * 1000);
      
      expect(isTimestampValid(tenMinutesAgo)).toBe(true);
      expect(isTimestampValid(tenMinutesFromNow)).toBe(true);
    });

    it('should reject timestamp outside window', () => {
      const now = Date.now();
      const twentyMinutesAgo = now - (20 * 60 * 1000);
      const twentyMinutesFromNow = now + (20 * 60 * 1000);
      
      expect(isTimestampValid(twentyMinutesAgo)).toBe(false);
      expect(isTimestampValid(twentyMinutesFromNow)).toBe(false);
    });

    it('should accept custom window size', () => {
      const now = Date.now();
      const thirtyMinutesAgo = now - (30 * 60 * 1000);
      
      // Should fail with default 15-minute window
      expect(isTimestampValid(thirtyMinutesAgo)).toBe(false);
      
      // Should pass with 60-minute window
      expect(isTimestampValid(thirtyMinutesAgo, 60 * 60 * 1000)).toBe(true);
    });
  });
});