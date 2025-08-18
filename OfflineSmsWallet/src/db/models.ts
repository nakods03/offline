import Realm, {BSON, ObjectSchema} from 'realm';

export class UserProfile extends Realm.Object<UserProfile> {
  id!: BSON.ObjectId;
  phoneE164!: string;
  deviceId!: string;
  publicKeyB64!: string;
  createdAt!: number;
  static schema: ObjectSchema = {
    name: 'UserProfile',
    primaryKey: 'id',
    properties: {
      id: 'objectId',
      phoneE164: 'string',
      deviceId: 'string',
      publicKeyB64: 'string',
      createdAt: 'int',
    },
  };
}

export class Wallet extends Realm.Object<Wallet> {
  id!: BSON.ObjectId;
  balanceCents!: number;
  updatedAt!: number;
  static schema: ObjectSchema = {
    name: 'Wallet',
    primaryKey: 'id',
    properties: {
      id: 'objectId',
      balanceCents: 'int',
      updatedAt: 'int',
    },
  };
}

export class Contact extends Realm.Object<Contact> {
  id!: BSON.ObjectId;
  phoneE164!: string;
  publicKeyB64!: string;
  label?: string;
  trusted!: boolean;
  createdAt!: number;
  static schema: ObjectSchema = {
    name: 'Contact',
    primaryKey: 'id',
    properties: {
      id: 'objectId',
      phoneE164: 'string',
      publicKeyB64: 'string',
      label: 'string?',
      trusted: 'bool',
      createdAt: 'int',
    },
  };
}

export type TxStatus =
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

export class Transaction extends Realm.Object<Transaction> {
  id!: string; // txid
  direction!: 'SENT' | 'RECEIVED';
  counterpartyPhone!: string;
  amountCents!: number;
  memo?: string;
  timestamp!: number;
  nonce!: string;
  status!: TxStatus;
  raw!: string;
  signatureB64!: string;
  deliveryMeta?: { smsId?: string; errorCode?: number; retries: number };
  verified!: boolean;
  createdAt!: number;
  updatedAt!: number;
  static schema: ObjectSchema = {
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
      deliveryMeta: 'mixed?',
      verified: 'bool',
      createdAt: 'int',
      updatedAt: 'int',
    },
  };
}

export class Settings extends Realm.Object<Settings> {
  id!: BSON.ObjectId;
  autoLockMs!: number;
  lastLockAt!: number;
  cloudEnabled!: boolean;
  lastBackupAt?: number;
  static schema: ObjectSchema = {
    name: 'Settings',
    primaryKey: 'id',
    properties: {
      id: 'objectId',
      autoLockMs: 'int',
      lastLockAt: 'int',
      cloudEnabled: 'bool',
      lastBackupAt: 'int?',
    },
  };
}

export class KeyItem extends Realm.Object<KeyItem> {
  id!: BSON.ObjectId;
  name!: string;
  cipherB64!: string;
  ivB64!: string;
  createdAt!: number;
  static schema: ObjectSchema = {
    name: 'KeyItem',
    primaryKey: 'id',
    properties: {
      id: 'objectId',
      name: 'string',
      cipherB64: 'string',
      ivB64: 'string',
      createdAt: 'int',
    },
  };
}

export const schemas = [UserProfile, Wallet, Contact, Transaction, Settings, KeyItem];

