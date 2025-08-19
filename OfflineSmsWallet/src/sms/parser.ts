import { ParsedTx, parseSmsPayload } from './protocol';

export function validateParsedTx(parsed: ParsedTx, myPhone: string): ParsedTx {
  if (parsed.to !== myPhone) throw new Error('Not addressed to me');
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parsed.ts) > 15 * 60) throw new Error('Timestamp out of window');
  if (!/^[0-9a-fA-F]{8,12}$/.test(parsed.n)) throw new Error('Bad nonce');
  if (!/^[0-9a-fA-F-]{20,}$/.test(parsed.txid)) throw new Error('Bad txid');
  const amt = Number(parsed.amt);
  if (!Number.isFinite(amt) || amt <= 0) throw new Error('Bad amount');
  return parsed;
}

export { parseSmsPayload };

