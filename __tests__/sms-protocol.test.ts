import { buildSmsPayload, parseSmsPayload, isValidE164, formatToE164, validateTransaction } from '../src/sms/protocol';
import { generateKeyPair } from '../src/crypto/signing';
import { DraftTransaction, UserProfile } from '../src/types';

describe('SMS Protocol', () => {
  const mockUserProfile: UserProfile = {
    id: 'test-user',
    phoneE164: '+1234567890',
    deviceId: 'test-device',
    publicKeyB64: 'test-public-key',
    createdAt: new Date(),
  };

  const { privateKey } = generateKeyPair();

  describe('buildSmsPayload', () => {
    it('should build a valid SMS payload', () => {
      const draft: DraftTransaction = {
        to: '+0987654321',
        amountCents: 1500, // $15.00
        memo: 'Test payment',
      };

      const result = buildSmsPayload(draft, mockUserProfile, privateKey);

      expect(result.text).toBeDefined();
      expect(result.txid).toBeDefined();
      expect(result.signedPayload).toBeDefined();
      expect(result.text).toContain('WLT1|TX|');
      expect(result.text).toContain('from:+1234567890');
      expect(result.text).toContain('to:+0987654321');
      expect(result.text).toContain('amt:15.00');
      expect(result.text).toContain('m:Test%20payment');
      expect(result.text).toContain('sig:');
    });

    it('should build payload without memo', () => {
      const draft: DraftTransaction = {
        to: '+0987654321',
        amountCents: 1000,
      };

      const result = buildSmsPayload(draft, mockUserProfile, privateKey);

      expect(result.text).not.toContain('m:');
      expect(result.text).toContain('amt:10.00');
    });

    it('should URL-encode memo properly', () => {
      const draft: DraftTransaction = {
        to: '+0987654321',
        amountCents: 1000,
        memo: 'Test & special chars!',
      };

      const result = buildSmsPayload(draft, mockUserProfile, privateKey);

      expect(result.text).toContain('m:Test%20%26%20special%20chars!');
    });
  });

  describe('parseSmsPayload', () => {
    it('should parse a valid SMS payload', () => {
      // First build a payload to parse
      const draft: DraftTransaction = {
        to: '+0987654321',
        amountCents: 1500,
        memo: 'Test payment',
      };

      const { text } = buildSmsPayload(draft, mockUserProfile, privateKey);
      const parsed = parseSmsPayload(text);

      expect(parsed.version).toBe('WLT1');
      expect(parsed.from).toBe('+1234567890');
      expect(parsed.to).toBe('+0987654321');
      expect(parsed.amount).toBe(15.00);
      expect(parsed.memo).toBe('Test payment');
      expect(parsed.signature).toBeDefined();
      expect(parsed.nonce).toBeDefined();
      expect(parsed.txid).toBeDefined();
      expect(parsed.timestamp).toBeDefined();
    });

    it('should reject invalid SMS format', () => {
      expect(() => parseSmsPayload('invalid sms')).toThrow('Invalid SMS format');
      expect(() => parseSmsPayload('WRONG|TX|test')).toThrow('Invalid SMS format');
      expect(() => parseSmsPayload('WLT1|WRONG|test')).toThrow('Invalid SMS format');
    });

    it('should reject SMS with missing required fields', () => {
      expect(() => parseSmsPayload('WLT1|TX|test123')).toThrow('insufficient components');
      expect(() => parseSmsPayload('WLT1|TX|test123|from:+1234567890')).toThrow('Missing required field');
    });

    it('should reject invalid phone numbers', () => {
      const invalidSms = 'WLT1|TX|test123|from:invalid|to:+1234567890|amt:10.00|ts:1234567890|n:abcd1234|sig:test';
      expect(() => parseSmsPayload(invalidSms)).toThrow('Invalid phone number format');
    });

    it('should reject invalid amounts', () => {
      const invalidSms = 'WLT1|TX|test123|from:+1234567890|to:+0987654321|amt:-10.00|ts:1234567890|n:abcd1234|sig:test';
      expect(() => parseSmsPayload(invalidSms)).toThrow('Invalid amount');
    });

    it('should reject timestamps outside valid window', () => {
      const oldTimestamp = Date.now() - (30 * 60 * 1000); // 30 minutes ago
      const invalidSms = `WLT1|TX|test123|from:+1234567890|to:+0987654321|amt:10.00|ts:${oldTimestamp}|n:abcd1234|sig:test`;
      expect(() => parseSmsPayload(invalidSms)).toThrow('Timestamp outside valid window');
    });
  });

  describe('isValidE164', () => {
    it('should accept valid E164 numbers', () => {
      expect(isValidE164('+1234567890')).toBe(true);
      expect(isValidE164('+447700900123')).toBe(true);
      expect(isValidE164('+919876543210')).toBe(true);
    });

    it('should reject invalid E164 numbers', () => {
      expect(isValidE164('1234567890')).toBe(false); // Missing +
      expect(isValidE164('+0234567890')).toBe(false); // Starts with 0
      expect(isValidE164('+123')).toBe(false); // Too short
      expect(isValidE164('+1234567890123456')).toBe(false); // Too long
      expect(isValidE164('')).toBe(false); // Empty
      expect(isValidE164('invalid')).toBe(false); // Not numeric
    });
  });

  describe('formatToE164', () => {
    it('should format US numbers correctly', () => {
      expect(formatToE164('1234567890')).toBe('+11234567890');
      expect(formatToE164('(123) 456-7890')).toBe('+11234567890');
      expect(formatToE164('123-456-7890')).toBe('+11234567890');
      expect(formatToE164('123.456.7890')).toBe('+11234567890');
    });

    it('should handle already formatted numbers', () => {
      expect(formatToE164('+1234567890')).toBe('+1234567890');
      expect(formatToE164('+447700900123')).toBe('+447700900123');
    });

    it('should handle international numbers', () => {
      expect(formatToE164('447700900123')).toBe('+447700900123');
      expect(formatToE164('919876543210')).toBe('+919876543210');
    });

    it('should return empty string for invalid numbers', () => {
      expect(formatToE164('123')).toBe(''); // Too short
      expect(formatToE164('invalid')).toBe(''); // Not numeric
      expect(formatToE164('')).toBe(''); // Empty
    });
  });

  describe('validateTransaction', () => {
    it('should accept valid transaction for me', () => {
      const parsed = {
        version: 'WLT1',
        txid: 'test123',
        from: '+0987654321',
        to: '+1234567890',
        amount: 10.00,
        timestamp: Date.now(),
        nonce: 'abcd1234',
        memo: 'Test',
        signature: 'test-sig',
        raw: 'test-raw',
      };

      expect(() => validateTransaction(parsed, '+1234567890')).not.toThrow();
    });

    it('should reject transaction not for me', () => {
      const parsed = {
        version: 'WLT1',
        txid: 'test123',
        from: '+0987654321',
        to: '+9999999999',
        amount: 10.00,
        timestamp: Date.now(),
        nonce: 'abcd1234',
        memo: 'Test',
        signature: 'test-sig',
        raw: 'test-raw',
      };

      expect(() => validateTransaction(parsed, '+1234567890')).toThrow('not addressed to this wallet');
    });

    it('should reject transaction from myself', () => {
      const parsed = {
        version: 'WLT1',
        txid: 'test123',
        from: '+1234567890',
        to: '+1234567890',
        amount: 10.00,
        timestamp: Date.now(),
        nonce: 'abcd1234',
        memo: 'Test',
        signature: 'test-sig',
        raw: 'test-raw',
      };

      expect(() => validateTransaction(parsed, '+1234567890')).toThrow('Cannot receive transaction from self');
    });

    it('should reject transaction with excessive amount', () => {
      const parsed = {
        version: 'WLT1',
        txid: 'test123',
        from: '+0987654321',
        to: '+1234567890',
        amount: 15000.00, // Over $10k limit
        timestamp: Date.now(),
        nonce: 'abcd1234',
        memo: 'Test',
        signature: 'test-sig',
        raw: 'test-raw',
      };

      expect(() => validateTransaction(parsed, '+1234567890')).toThrow('Amount exceeds maximum limit');
    });

    it('should reject transaction with long memo', () => {
      const longMemo = 'a'.repeat(150); // Over 100 char limit
      const parsed = {
        version: 'WLT1',
        txid: 'test123',
        from: '+0987654321',
        to: '+1234567890',
        amount: 10.00,
        timestamp: Date.now(),
        nonce: 'abcd1234',
        memo: longMemo,
        signature: 'test-sig',
        raw: 'test-raw',
      };

      expect(() => validateTransaction(parsed, '+1234567890')).toThrow('Memo too long');
    });
  });
});