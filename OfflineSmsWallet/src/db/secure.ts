import * as Keychain from 'react-native-keychain';
import { randomBytes } from 'react-native-quick-crypto';
import base64url from 'base64url';
import { generateKeypair } from '@/crypto';

const REALM_SERVICE = 'wallet.realmKey';
const PRIVKEY_SERVICE = 'wallet.privateKey';

export async function getOrCreateRealmKey(): Promise<Uint8Array> {
  const existing = await Keychain.getGenericPassword({ service: REALM_SERVICE });
  if (existing) {
    return Buffer.from(existing.password, 'base64');
  }
  const key = randomBytes(64);
  await Keychain.setGenericPassword('realm', Buffer.from(key).toString('base64'), { service: REALM_SERVICE, accessible: Keychain.ACCESSIBLE.ALWAYS_THIS_DEVICE_ONLY });
  return key;
}

export async function getOrCreatePrivateKeyB64(): Promise<{ publicKeyB64: string; privateKeyB64: string }> {
  const existing = await Keychain.getGenericPassword({ service: PRIVKEY_SERVICE });
  if (existing) {
    return { publicKeyB64: existing.username, privateKeyB64: existing.password };
  }
  const { publicKeyB64, privateKeyB64 } = generateKeypair();
  await Keychain.setGenericPassword(publicKeyB64, privateKeyB64, { service: PRIVKEY_SERVICE, accessible: Keychain.ACCESSIBLE.ALWAYS_THIS_DEVICE_ONLY });
  return { publicKeyB64, privateKeyB64 };
}

