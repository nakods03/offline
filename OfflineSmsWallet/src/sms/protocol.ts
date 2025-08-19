import { v4 as uuidv4 } from 'uuid';
import base64url from 'base64url';

export type DraftTx = {
  to: string;
  amountCents: number;
  memo?: string;
};

export type SenderProfile = {
  phoneE164: string;
  publicKeyB64: string;
};

export type ParsedTx = {
  version: string;
  kind: 'TX';
  txid: string;
  from: string;
  to: string;
  amt: string;
  ts: number;
  n: string;
  m?: string;
  sig: string;
  rawWithoutSig: string;
};

export function formatAmount(amountCents: number): string {
  const whole = Math.floor(amountCents / 100);
  const cents = Math.abs(amountCents % 100);
  return `${whole}.${cents.toString().padStart(2, '0')}`;
}

function urlEncodeMemo(memo?: string) {
  if (!memo) return undefined;
  return encodeURIComponent(memo);
}

export function buildSmsPayload(tx: DraftTx, sender: SenderProfile): { text: string; txid: string } {
  const txid = uuidv4().replace(/-/g, '');
  const now = Math.floor(Date.now() / 1000);
  const nonce = Math.random().toString(16).slice(2, 10);
  const parts = [
    'WLT1',
    'TX',
    txid,
    `from:${sender.phoneE164}`,
    `to:${tx.to}`,
    `amt:${formatAmount(tx.amountCents)}`,
    `ts:${now}`,
    `n:${nonce}`,
  ];
  const memoEnc = urlEncodeMemo(tx.memo);
  let prefix = parts.join('|');
  if (memoEnc && memoEnc.length > 0) {
    prefix += `|m:${memoEnc}`;
  }
  // Signature will be appended by sign() function by caller
  const text = `${prefix}|sig:`; // caller appends base64url signature
  return { text, txid };
}

export function parseSmsPayload(text: string): ParsedTx {
  if (!text.startsWith('WLT1|TX|')) throw new Error('Invalid prefix');
  const sigIdx = text.indexOf('|sig:');
  if (sigIdx < 0) throw new Error('Missing signature');
  const rawWithoutSig = text.slice(0, sigIdx);
  const sig = text.slice(sigIdx + 5);
  const fields = rawWithoutSig.split('|');
  const [version, kind, txid, fromField, toField, amtField, tsField, nField, maybeMemo] = fields;
  const from = fromField?.startsWith('from:') ? fromField.slice(5) : '';
  const to = toField?.startsWith('to:') ? toField.slice(3) : '';
  const amt = amtField?.startsWith('amt:') ? amtField.slice(4) : '';
  const tsStr = tsField?.startsWith('ts:') ? tsField.slice(3) : '';
  const n = nField?.startsWith('n:') ? nField.slice(2) : '';
  let m: string | undefined;
  if (maybeMemo && maybeMemo.startsWith('m:')) {
    m = maybeMemo.slice(2);
  }
  const ts = Number(tsStr);
  if (!version || !kind || !txid || !from || !to || !amt || !ts || !n) {
    throw new Error('Missing required fields');
  }
  return { version, kind: 'TX', txid, from, to, amt, ts, n, m, sig, rawWithoutSig };
}

