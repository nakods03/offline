import create from 'zustand';
import { getRealm } from '@/db';
import { Transaction } from '@/db/models';

type TxState = {
  createDraft: (fields: { id: string; direction: 'SENT' | 'RECEIVED'; counterpartyPhone: string; amountCents: number; memo?: string; timestamp: number; nonce: string; raw: string; signatureB64: string; status: string; verified: boolean }) => Promise<void>;
  updateStatus: (id: string, status: string, updates?: Partial<Transaction>) => Promise<void>;
};

export const useTxStore = create<TxState>(() => ({
  async createDraft(fields) {
    const realm = await getRealm();
    realm.write(() => {
      realm.create<Transaction>('Transaction', {
        id: fields.id,
        direction: fields.direction,
        counterpartyPhone: fields.counterpartyPhone,
        amountCents: fields.amountCents,
        memo: fields.memo,
        timestamp: fields.timestamp,
        nonce: fields.nonce,
        status: fields.status as any,
        raw: fields.raw,
        signatureB64: fields.signatureB64,
        deliveryMeta: { retries: 0 },
        verified: fields.verified,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }, Realm.UpdateMode.Never);
    });
  },
  async updateStatus(id, status, updates) {
    const realm = await getRealm();
    realm.write(() => {
      const tx = realm.objectForPrimaryKey<Transaction>('Transaction', id);
      if (tx) {
        tx.status = status as any;
        tx.updatedAt = Date.now();
        if (updates) Object.assign(tx, updates);
      }
    });
  },
}));

