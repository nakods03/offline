import { QRData, UserProfile } from '@/types';

// Generate QR data for sharing wallet info
export const generateWalletQR = (userProfile: UserProfile, displayName?: string): string => {
  const qrData: QRData = {
    v: 1, // version
    phone: userProfile.phoneE164,
    deviceId: userProfile.deviceId,
    pubKey: userProfile.publicKeyB64,
    name: displayName,
  };

  return JSON.stringify(qrData);
};

// Parse QR data from scanned code
export const parseWalletQR = (qrString: string): QRData => {
  try {
    const data = JSON.parse(qrString);
    
    // Validate required fields
    if (!data.v || !data.phone || !data.deviceId || !data.pubKey) {
      throw new Error('Missing required QR data fields');
    }

    // Validate version
    if (data.v !== 1) {
      throw new Error(`Unsupported QR version: ${data.v}`);
    }

    // Validate phone format (basic E.164 check)
    if (!data.phone.startsWith('+') || data.phone.length < 10) {
      throw new Error('Invalid phone number format in QR');
    }

    // Validate public key format (base64url)
    if (typeof data.pubKey !== 'string' || data.pubKey.length < 32) {
      throw new Error('Invalid public key format in QR');
    }

    return {
      v: data.v,
      phone: data.phone,
      deviceId: data.deviceId,
      pubKey: data.pubKey,
      name: data.name || undefined,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to parse QR code: ${error.message}`);
    }
    throw new Error('Failed to parse QR code: Invalid format');
  }
};

// Validate QR data structure
export const validateQRData = (data: any): data is QRData => {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.v === 'number' &&
    data.v === 1 &&
    typeof data.phone === 'string' &&
    data.phone.startsWith('+') &&
    typeof data.deviceId === 'string' &&
    data.deviceId.length > 0 &&
    typeof data.pubKey === 'string' &&
    data.pubKey.length > 0 &&
    (data.name === undefined || typeof data.name === 'string')
  );
};