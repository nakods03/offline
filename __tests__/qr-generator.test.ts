import { generateWalletQR, parseWalletQR, validateQRData } from '../src/qr/generator';
import { UserProfile } from '../src/types';

describe('QR Generator', () => {
  const mockUserProfile: UserProfile = {
    id: 'test-user',
    phoneE164: '+1234567890',
    deviceId: 'test-device-123',
    publicKeyB64: 'dGVzdC1wdWJsaWMta2V5LWJhc2U2NC1lbmNvZGVk', // base64 encoded test key
    createdAt: new Date(),
  };

  describe('generateWalletQR', () => {
    it('should generate valid QR JSON string', () => {
      const qrString = generateWalletQR(mockUserProfile);
      
      expect(typeof qrString).toBe('string');
      expect(() => JSON.parse(qrString)).not.toThrow();
      
      const parsed = JSON.parse(qrString);
      expect(parsed.v).toBe(1);
      expect(parsed.phone).toBe('+1234567890');
      expect(parsed.deviceId).toBe('test-device-123');
      expect(parsed.pubKey).toBe('dGVzdC1wdWJsaWMta2V5LWJhc2U2NC1lbmNvZGVk');
    });

    it('should include display name when provided', () => {
      const qrString = generateWalletQR(mockUserProfile, 'John Doe');
      const parsed = JSON.parse(qrString);
      
      expect(parsed.name).toBe('John Doe');
    });

    it('should not include name field when not provided', () => {
      const qrString = generateWalletQR(mockUserProfile);
      const parsed = JSON.parse(qrString);
      
      expect(parsed.name).toBeUndefined();
    });
  });

  describe('parseWalletQR', () => {
    it('should parse valid QR data', () => {
      const qrString = generateWalletQR(mockUserProfile, 'Test User');
      const parsed = parseWalletQR(qrString);
      
      expect(parsed.v).toBe(1);
      expect(parsed.phone).toBe('+1234567890');
      expect(parsed.deviceId).toBe('test-device-123');
      expect(parsed.pubKey).toBe('dGVzdC1wdWJsaWMta2V5LWJhc2U2NC1lbmNvZGVk');
      expect(parsed.name).toBe('Test User');
    });

    it('should parse QR data without name', () => {
      const qrString = generateWalletQR(mockUserProfile);
      const parsed = parseWalletQR(qrString);
      
      expect(parsed.v).toBe(1);
      expect(parsed.phone).toBe('+1234567890');
      expect(parsed.deviceId).toBe('test-device-123');
      expect(parsed.pubKey).toBe('dGVzdC1wdWJsaWMta2V5LWJhc2U2NC1lbmNvZGVk');
      expect(parsed.name).toBeUndefined();
    });

    it('should reject invalid JSON', () => {
      expect(() => parseWalletQR('invalid json')).toThrow('Failed to parse QR code');
      expect(() => parseWalletQR('{"incomplete": true')).toThrow('Failed to parse QR code');
    });

    it('should reject QR data with missing required fields', () => {
      const invalidData = {
        v: 1,
        phone: '+1234567890',
        // Missing deviceId and pubKey
      };
      
      expect(() => parseWalletQR(JSON.stringify(invalidData))).toThrow('Missing required QR data fields');
    });

    it('should reject unsupported version', () => {
      const futureVersionData = {
        v: 2,
        phone: '+1234567890',
        deviceId: 'test-device',
        pubKey: 'test-key',
      };
      
      expect(() => parseWalletQR(JSON.stringify(futureVersionData))).toThrow('Unsupported QR version: 2');
    });

    it('should reject invalid phone format', () => {
      const invalidPhoneData = {
        v: 1,
        phone: '1234567890', // Missing +
        deviceId: 'test-device',
        pubKey: 'test-key',
      };
      
      expect(() => parseWalletQR(JSON.stringify(invalidPhoneData))).toThrow('Invalid phone number format in QR');
    });

    it('should reject short public key', () => {
      const shortKeyData = {
        v: 1,
        phone: '+1234567890',
        deviceId: 'test-device',
        pubKey: 'short', // Too short
      };
      
      expect(() => parseWalletQR(JSON.stringify(shortKeyData))).toThrow('Invalid public key format in QR');
    });
  });

  describe('validateQRData', () => {
    it('should validate correct QR data', () => {
      const validData = {
        v: 1,
        phone: '+1234567890',
        deviceId: 'test-device',
        pubKey: 'dGVzdC1wdWJsaWMta2V5LWJhc2U2NC1lbmNvZGVk',
        name: 'Test User',
      };
      
      expect(validateQRData(validData)).toBe(true);
    });

    it('should validate QR data without optional name', () => {
      const validData = {
        v: 1,
        phone: '+1234567890',
        deviceId: 'test-device',
        pubKey: 'dGVzdC1wdWJsaWMta2V5LWJhc2U2NC1lbmNvZGVk',
      };
      
      expect(validateQRData(validData)).toBe(true);
    });

    it('should reject null or undefined data', () => {
      expect(validateQRData(null)).toBe(false);
      expect(validateQRData(undefined)).toBe(false);
      expect(validateQRData('string')).toBe(false);
      expect(validateQRData(123)).toBe(false);
    });

    it('should reject data with missing required fields', () => {
      expect(validateQRData({})).toBe(false);
      expect(validateQRData({ v: 1 })).toBe(false);
      expect(validateQRData({ v: 1, phone: '+1234567890' })).toBe(false);
      expect(validateQRData({ v: 1, phone: '+1234567890', deviceId: 'test' })).toBe(false);
    });

    it('should reject data with wrong types', () => {
      const wrongTypes = {
        v: '1', // Should be number
        phone: 1234567890, // Should be string
        deviceId: 123, // Should be string
        pubKey: null, // Should be string
      };
      
      expect(validateQRData(wrongTypes)).toBe(false);
    });

    it('should reject unsupported version', () => {
      const wrongVersion = {
        v: 2, // Only v1 supported
        phone: '+1234567890',
        deviceId: 'test-device',
        pubKey: 'test-key',
      };
      
      expect(validateQRData(wrongVersion)).toBe(false);
    });

    it('should reject invalid phone format', () => {
      const invalidPhone = {
        v: 1,
        phone: '1234567890', // Missing +
        deviceId: 'test-device',
        pubKey: 'test-key',
      };
      
      expect(validateQRData(invalidPhone)).toBe(false);
    });

    it('should reject empty strings', () => {
      const emptyStrings = {
        v: 1,
        phone: '',
        deviceId: '',
        pubKey: '',
      };
      
      expect(validateQRData(emptyStrings)).toBe(false);
    });

    it('should accept valid name and reject invalid name type', () => {
      const validName = {
        v: 1,
        phone: '+1234567890',
        deviceId: 'test-device',
        pubKey: 'test-key',
        name: 'Valid Name',
      };
      
      const invalidName = {
        v: 1,
        phone: '+1234567890',
        deviceId: 'test-device',
        pubKey: 'test-key',
        name: 123, // Should be string
      };
      
      expect(validateQRData(validName)).toBe(true);
      expect(validateQRData(invalidName)).toBe(false);
    });
  });
});