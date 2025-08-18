import Realm from 'realm';

// User Profile Schema
export class UserProfileSchema extends Realm.Object<UserProfileSchema> {
  id!: string;
  phoneE164!: string;
  deviceId!: string;
  publicKeyB64!: string;
  createdAt!: Date;

  static schema: Realm.ObjectSchema = {
    name: 'UserProfile',
    primaryKey: 'id',
    properties: {
      id: 'string',
      phoneE164: 'string',
      deviceId: 'string',
      publicKeyB64: 'string',
      createdAt: 'date',
    },
  };
}

// Wallet Schema
export class WalletSchema extends Realm.Object<WalletSchema> {
  id!: string;
  balanceCents!: number;
  updatedAt!: Date;

  static schema: Realm.ObjectSchema = {
    name: 'Wallet',
    primaryKey: 'id',
    properties: {
      id: 'string',
      balanceCents: 'int',
      updatedAt: 'date',
    },
  };
}

// Contact Schema
export class ContactSchema extends Realm.Object<ContactSchema> {
  id!: string;
  phoneE164!: string;
  publicKeyB64!: string;
  label?: string;
  trusted!: boolean;
  createdAt!: Date;

  static schema: Realm.ObjectSchema = {
    name: 'Contact',
    primaryKey: 'id',
    properties: {
      id: 'string',
      phoneE164: 'string',
      publicKeyB64: 'string',
      label: 'string?',
      trusted: 'bool',
      createdAt: 'date',
    },
  };
}

// Delivery Meta Schema (embedded object)
export class DeliveryMetaSchema extends Realm.Object<DeliveryMetaSchema> {
  smsId?: string;
  errorCode?: number;
  retries!: number;

  static schema: Realm.ObjectSchema = {
    name: 'DeliveryMeta',
    embedded: true,
    properties: {
      smsId: 'string?',
      errorCode: 'int?',
      retries: 'int',
    },
  };
}

// Transaction Schema
export class TransactionSchema extends Realm.Object<TransactionSchema> {
  id!: string; // txid
  direction!: string;
  counterpartyPhone!: string;
  amountCents!: number;
  memo?: string;
  timestamp!: number;
  nonce!: string;
  status!: string;
  raw!: string;
  signatureB64!: string;
  deliveryMeta?: DeliveryMetaSchema;
  verified!: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  static schema: Realm.ObjectSchema = {
    name: 'Transaction',
    primaryKey: 'id',
    properties: {
      id: 'string',
      direction: 'string',
      counterpartyPhone: 'string',
      amountCents: 'int',
      memo: 'string?',
      timestamp: 'int',
      nonce: 'string',
      status: 'string',
      raw: 'string',
      signatureB64: 'string',
      deliveryMeta: 'DeliveryMeta?',
      verified: 'bool',
      createdAt: 'date',
      updatedAt: 'date',
    },
  };
}

// Settings Schema
export class SettingsSchema extends Realm.Object<SettingsSchema> {
  id!: string;
  autoLockMs!: number;
  lastLockAt?: Date;
  cloudEnabled!: boolean;
  lastBackupAt?: Date;

  static schema: Realm.ObjectSchema = {
    name: 'Settings',
    primaryKey: 'id',
    properties: {
      id: 'string',
      autoLockMs: 'int',
      lastLockAt: 'date?',
      cloudEnabled: 'bool',
      lastBackupAt: 'date?',
    },
  };
}

// Encrypted Key Schema (for storing private key securely)
export class EncryptedKeySchema extends Realm.Object<EncryptedKeySchema> {
  id!: string;
  encryptedPrivateKey!: string;
  iv!: string;
  createdAt!: Date;

  static schema: Realm.ObjectSchema = {
    name: 'EncryptedKey',
    primaryKey: 'id',
    properties: {
      id: 'string',
      encryptedPrivateKey: 'string',
      iv: 'string',
      createdAt: 'date',
    },
  };
}

// Nonce Cache Schema (for replay protection)
export class NonceCacheSchema extends Realm.Object<NonceCacheSchema> {
  id!: string; // nonce
  txid!: string;
  timestamp!: number;
  createdAt!: Date;

  static schema: Realm.ObjectSchema = {
    name: 'NonceCache',
    primaryKey: 'id',
    properties: {
      id: 'string', // nonce
      txid: 'string',
      timestamp: 'int',
      createdAt: 'date',
    },
  };
}

// All schemas for Realm initialization
export const AllSchemas = [
  UserProfileSchema,
  WalletSchema,
  ContactSchema,
  DeliveryMetaSchema,
  TransactionSchema,
  SettingsSchema,
  EncryptedKeySchema,
  NonceCacheSchema,
];