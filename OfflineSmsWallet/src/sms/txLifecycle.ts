import { buildSmsPayload } from './payload';
import { sign, verify } from '@/crypto';
import { sendSms } from './bridge';
import { useTxStore } from '@/state/tx';
import { applyOutgoing, applyIncoming } from '@/state/wallet';
import { parseSmsPayload } from './parser';

export async function createAndSendTx(draft: { to: string; amountCents: number; memo?: string }, profile: { phoneE164: string; publicKeyB64: string }, privateKeyB64: string) {
  const { text, txid } = buildSmsPayload(draft, profile);
  const sig = sign(text, privateKeyB64);
  const full = `${text}${sig}`;
  const now = Math.floor(Date.now() / 1000);
  await useTxStore.getState().createDraft({
    id: txid,
    direction: 'SENT',
    counterpartyPhone: draft.to,
    amountCents: draft.amountCents,
    memo: draft.memo,
    timestamp: now,
    nonce: 'n',
    raw: full,
    signatureB64: sig,
    status: 'SENDING',
    verified: true,
  });
  await applyOutgoing(txid, draft.amountCents);
  await sendSms(draft.to, full, txid);
}

export async function onIncomingRaw(raw: string, knownPubKeyB64?: string, myPhone?: string) {
  const parsed = parseSmsPayload(raw);
  const verified = knownPubKeyB64 ? verify(parsed.rawWithoutSig, parsed.sig, knownPubKeyB64) : false;
  const amountCents = Math.round(Number(parsed.amt) * 100);
  await applyIncoming({
    txid: parsed.txid,
    amountCents,
    from: parsed.from,
    timestamp: parsed.ts,
    nonce: parsed.n,
    raw,
    signatureB64: parsed.sig,
    verified,
  });
}

