// Core Types
export interface UserProfile {
  id: string;
  phoneE164: string;
  deviceId: string;
  publicKeyB64: string;
  createdAt: Date;
}

export interface Wallet {
  id: string;
  balanceCents: number;
  updatedAt: Date;
}

export interface Contact {
  id: string;
  phoneE164: string;
  publicKeyB64: string;
  label?: string;
  trusted: boolean;
  createdAt: Date;
}

export type TransactionDirection = 'SENT' | 'RECEIVED';

export type TransactionStatus = 
  | 'DRAFT' 
  | 'SENDING' 
  | 'SENT' 
  | 'DELIVERED' 
  | 'APPLIED' 
  | 'FAILED_TEMP' 
  | 'FAILED_PERM' 
  | 'INCOMING' 
  | 'VERIFIED' 
  | 'UNVERIFIED';

export interface DeliveryMeta {
  smsId?: string;
  errorCode?: number;
  retries: number;
}

export interface Transaction {
  id: string; // txid
  direction: TransactionDirection;
  counterpartyPhone: string;
  amountCents: number;
  memo?: string;
  timestamp: number; // epoch
  nonce: string;
  status: TransactionStatus;
  raw: string;
  signatureB64: string;
  deliveryMeta?: DeliveryMeta;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Settings {
  id: string;
  autoLockMs: number;
  lastLockAt?: Date;
  cloudEnabled: boolean;
  lastBackupAt?: Date;
}

// SMS Protocol Types
export interface ParsedTransaction {
  version: string;
  txid: string;
  from: string;
  to: string;
  amount: number;
  timestamp: number;
  nonce: string;
  memo?: string;
  signature: string;
  raw: string;
}

export interface DraftTransaction {
  to: string;
  amountCents: number;
  memo?: string;
}

// QR Code Types
export interface QRData {
  v: number; // version
  phone: string;
  deviceId: string;
  pubKey: string;
  name?: string;
}

// SMS Events
export interface SmsEvent {
  requestId: string;
  phoneNumber: string;
  timestamp: number;
  status: string;
  message?: string;
  errorCode?: number;
}

export interface IncomingSmsEvent {
  raw: string;
  senderPhone: string;
  timestamp: number;
  receivedAt: number;
}

// Auth Types
export interface PinState {
  isLocked: boolean;
  hasPin: boolean;
  lastActivity: number;
  autoLockMs: number;
}

// Cloud Backup Types
export interface BackupData {
  version: number;
  timestamp: number;
  userProfile: UserProfile;
  wallet: Wallet;
  contacts: Contact[];
  transactions: Transaction[];
  settings: Settings;
}

export interface EncryptedBackup {
  blob: string; // base64 encrypted data
  salt: string;
  iv: string;
  timestamp: number;
}

// Navigation Types
export type RootStackParamList = {
  Onboarding: undefined;
  Welcome: undefined;
  PhoneInput: undefined;
  CreatePin: undefined;
  GenerateKeys: undefined;
  ShowQR: undefined;
  Main: undefined;
  Home: undefined;
  Send: undefined;
  Receive: undefined;
  History: undefined;
  Settings: undefined;
  PinLock: { onUnlock: () => void };
  TransactionDetail: { txid: string };
  ContactDetail: { contactId: string };
  QRScanner: { onScan: (data: QRData) => void };
  Backup: undefined;
  Restore: undefined;
};

export type TabParamList = {
  Home: undefined;
  Send: undefined;
  Receive: undefined;
  History: undefined;
  Settings: undefined;
};

// Utility Types
export type FilterType = 'ALL' | 'SENT' | 'RECEIVED' | 'PENDING';

export interface PermissionState {
  sms: boolean;
  camera: boolean;
  contacts?: boolean;
}

// Error Types
export class WalletError extends Error {
  constructor(
    message: string,
    public code: string,
    public data?: any
  ) {
    super(message);
    this.name = 'WalletError';
  }
}

export class CryptoError extends WalletError {
  constructor(message: string, data?: any) {
    super(message, 'CRYPTO_ERROR', data);
  }
}

export class SmsError extends WalletError {
  constructor(message: string, data?: any) {
    super(message, 'SMS_ERROR', data);
  }
}

export class ValidationError extends WalletError {
  constructor(message: string, data?: any) {
    super(message, 'VALIDATION_ERROR', data);
  }
}