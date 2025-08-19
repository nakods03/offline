import Realm from 'realm';
import { schemas } from './models';
import { getOrCreateRealmKey } from './secure';

let realmInstance: Realm | null = null;

export async function getRealm(): Promise<Realm> {
  if (realmInstance) return realmInstance;
  const key = await getOrCreateRealmKey();
  realmInstance = await Realm.open({ schema: schemas, schemaVersion: 1, encryptionKey: key });
  return realmInstance;
}

