import { buildSmsPayload } from './payload';
import { sign } from '@/crypto';

export function buildAndSign(tx: { to: string; amountCents: number; memo?: string }, sender: { phoneE164: string; publicKeyB64: string }, privateKeyB64: string) {
  const { text, txid } = buildSmsPayload(tx, sender);
  const sig = sign(text, privateKeyB64);
  const full = `${text}${sig}`;
  return { text: full, txid, signature: sig };
}

