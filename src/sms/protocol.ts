import { DraftTransaction, ParsedTransaction, UserProfile, ValidationError } from '@/types';
import { generateTxId, generateNonce, signPayload, verifySignature, isTimestampValid } from '@/crypto/signing';

// SMS Protocol Format:
// WLT1|TX|<txid>|from:<E164>|to:<E164>|amt:<number>|ts:<epoch>|n:<8hex>|m:<urlenc>|sig:<b64url>

export interface SmsPayloadResult {
  text: string;
  txid: string;
  signedPayload: string;
}

// Build SMS payload from draft transaction
export const buildSmsPayload = (
  draft: DraftTransaction,
  senderProfile: UserProfile,
  privateKeyHex: string
): SmsPayloadResult => {
  try {
    // Generate transaction components
    const txid = generateTxId();
    const timestamp = Date.now();
    const nonce = generateNonce(8);
    
    // Format amount (remove decimal point, ensure 2 decimal places)
    const amountStr = (draft.amountCents / 100).toFixed(2);
    
    // Build payload components
    const components = [
      'WLT1',
      'TX',
      txid,
      `from:${senderProfile.phoneE164}`,
      `to:${draft.to}`,
      `amt:${amountStr}`,
      `ts:${timestamp}`,
      `n:${nonce}`,
    ];
    
    // Add memo if present
    if (draft.memo && draft.memo.trim()) {
      const encodedMemo = encodeURIComponent(draft.memo.trim());
      components.push(`m:${encodedMemo}`);
    }
    
    // Create signing payload (everything before signature)
    const signingPayload = components.join('|');
    
    // Sign the payload
    const signature = signPayload(signingPayload, privateKeyHex);
    
    // Build final SMS text
    const finalText = `${signingPayload}|sig:${signature}`;
    
    // Validate SMS length (warn if too long)
    if (finalText.length > 160) {
      console.warn(`SMS payload is ${finalText.length} characters (may be split)`);
    }
    
    return {
      text: finalText,
      txid,
      signedPayload: signingPayload,
    };
  } catch (error) {
    throw new ValidationError('Failed to build SMS payload', error);
  }
};

// Parse incoming SMS payload
export const parseSmsPayload = (smsText: string): ParsedTransaction => {
  try {
    // Validate format
    if (!smsText.startsWith('WLT1|TX|')) {
      throw new ValidationError('Invalid SMS format - missing WLT1|TX| prefix');
    }
    
    // Split components
    const parts = smsText.split('|');
    if (parts.length < 8) {
      throw new ValidationError('Invalid SMS format - insufficient components');
    }
    
    // Parse required components
    const version = parts[0];
    const type = parts[1];
    const txid = parts[2];
    
    if (version !== 'WLT1' || type !== 'TX') {
      throw new ValidationError('Invalid SMS format - wrong version or type');
    }
    
    // Parse key-value pairs
    const kvPairs: Record<string, string> = {};
    let signatureIndex = -1;
    
    for (let i = 3; i < parts.length; i++) {
      const part = parts[i];
      if (part.startsWith('sig:')) {
        signatureIndex = i;
        kvPairs['sig'] = part.substring(4);
        break;
      } else {
        const colonIndex = part.indexOf(':');
        if (colonIndex > 0) {
          const key = part.substring(0, colonIndex);
          const value = part.substring(colonIndex + 1);
          kvPairs[key] = value;
        }
      }
    }
    
    // Validate required fields
    const requiredFields = ['from', 'to', 'amt', 'ts', 'n', 'sig'];
    for (const field of requiredFields) {
      if (!kvPairs[field]) {
        throw new ValidationError(`Missing required field: ${field}`);
      }
    }
    
    // Parse and validate values
    const from = kvPairs['from'];
    const to = kvPairs['to'];
    const amountStr = kvPairs['amt'];
    const timestampStr = kvPairs['ts'];
    const nonce = kvPairs['n'];
    const signature = kvPairs['sig'];
    const memo = kvPairs['m'] ? decodeURIComponent(kvPairs['m']) : undefined;
    
    // Validate phone numbers (basic E.164 format)
    if (!isValidE164(from) || !isValidE164(to)) {
      throw new ValidationError('Invalid phone number format');
    }
    
    // Parse amount
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      throw new ValidationError('Invalid amount');
    }
    
    // Parse timestamp
    const timestamp = parseInt(timestampStr);
    if (isNaN(timestamp) || timestamp <= 0) {
      throw new ValidationError('Invalid timestamp');
    }
    
    // Validate timestamp window
    if (!isTimestampValid(timestamp)) {
      throw new ValidationError('Timestamp outside valid window (±15 minutes)');
    }
    
    // Validate nonce format (hex)
    if (!/^[0-9a-fA-F]+$/.test(nonce)) {
      throw new ValidationError('Invalid nonce format');
    }
    
    // Reconstruct signing payload
    const signingComponents = parts.slice(0, signatureIndex);
    const signingPayload = signingComponents.join('|');
    
    return {
      version,
      txid,
      from,
      to,
      amount,
      timestamp,
      nonce,
      memo,
      signature,
      raw: smsText,
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ValidationError('Failed to parse SMS payload', error);
  }
};

// Validate E.164 phone number format
export const isValidE164 = (phone: string): boolean => {
  // Basic E.164 validation: starts with +, followed by 1-15 digits
  return /^\+[1-9]\d{1,14}$/.test(phone);
};

// Format phone number to E.164
export const formatToE164 = (phone: string, defaultCountryCode: string = '+1'): string => {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // If already starts with +, return as-is if valid
  if (phone.startsWith('+')) {
    return isValidE164(phone) ? phone : '';
  }
  
  // If starts with country code (without +), add +
  if (digits.length > 10) {
    const withPlus = '+' + digits;
    return isValidE164(withPlus) ? withPlus : '';
  }
  
  // Otherwise, prepend default country code
  const withCountryCode = defaultCountryCode + digits;
  return isValidE164(withCountryCode) ? withCountryCode : '';
};

// Validate transaction against business rules
export const validateTransaction = (parsed: ParsedTransaction, myPhone: string): void => {
  // Check if transaction is for me
  if (parsed.to !== myPhone) {
    throw new ValidationError('Transaction not addressed to this wallet');
  }
  
  // Check if not from myself
  if (parsed.from === myPhone) {
    throw new ValidationError('Cannot receive transaction from self');
  }
  
  // Validate amount limits (example: max $10,000)
  if (parsed.amount > 10000) {
    throw new ValidationError('Amount exceeds maximum limit');
  }
  
  // Validate memo length
  if (parsed.memo && parsed.memo.length > 100) {
    throw new ValidationError('Memo too long');
  }
};

// Check if nonce has been seen before (replay protection)
export const isNonceUsed = (nonce: string, txid: string, realm: any): boolean => {
  const existingNonce = realm.objectForPrimaryKey('NonceCache', nonce);
  return existingNonce !== null && existingNonce.txid !== txid;
};

// Store nonce for replay protection
export const storeNonce = (nonce: string, txid: string, timestamp: number, realm: any): void => {
  realm.write(() => {
    realm.create('NonceCache', {
      id: nonce,
      txid,
      timestamp,
      createdAt: new Date(),
    }, 'modified');
  });
};