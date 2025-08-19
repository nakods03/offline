import create from 'zustand';
import { getRealm } from '@/db';
import { Transaction, Wallet } from '@/db/models';

type WalletState = {
  balanceCents: number;
  initialized: boolean;
  applyOutgoing: (txid: string, amountCents: number) => Promise<void>;
  applyIncoming: (parsed: { txid: string; amountCents: number; from: string; timestamp: number; nonce: string; raw: string; signatureB64: string; verified: boolean }) => Promise<void>;
};

export const useWalletStore = create<WalletState>((set, get) => ({
  balanceCents: 0,
  initialized: false,
  async applyOutgoing(txid, amountCents) {
    const realm = await getRealm();
    realm.write(() => {
      const wallet = realm.objects<Wallet>('Wallet')[0] ?? realm.create('Wallet', { id: new Realm.BSON.ObjectId(), balanceCents: 0, updatedAt: Date.now() });
      wallet.balanceCents -= amountCents;
      wallet.updatedAt = Date.now();
    });
    set({ balanceCents: realm.objects<Wallet>('Wallet')[0]?.balanceCents ?? 0 });
  },
  async applyIncoming(parsed) {
    const realm = await getRealm();
    const amountCents = parsed.amountCents;
    realm.write(() => {
      const wallet = realm.objects<Wallet>('Wallet')[0] ?? realm.create('Wallet', { id: new Realm.BSON.ObjectId(), balanceCents: 0, updatedAt: Date.now() });
      wallet.balanceCents += amountCents;
      wallet.updatedAt = Date.now();
      realm.create<Transaction>('Transaction', {
        id: parsed.txid,
        direction: 'RECEIVED',
        counterpartyPhone: parsed.from,
        amountCents,
        memo: undefined,
        timestamp: parsed.timestamp,
        nonce: parsed.nonce,
        status: 'APPLIED',
        raw: parsed.raw,
        signatureB64: parsed.signatureB64,
        deliveryMeta: { retries: 0 },
        verified: parsed.verified,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }, Realm.UpdateMode.Never);
    });
    set({ balanceCents: realm.objects<Wallet>('Wallet')[0]?.balanceCents ?? 0 });
  },
}));

export async function applyOutgoing(txid: string, amountCents: number) {
  await useWalletStore.getState().applyOutgoing(txid, amountCents);
}

export async function applyIncoming(parsed: { txid: string; amountCents: number; from: string; timestamp: number; nonce: string; raw: string; signatureB64: string; verified: boolean }) {
  await useWalletStore.getState().applyIncoming(parsed);
}

