import { buildSmsPayload as _build, parseSmsPayload as _parse, ParsedTx } from './protocol';
export { ParsedTx } from './protocol';

export function buildSmsPayload(tx: DraftTx, sender: SenderProfile) {
  return _build(tx, sender);
}

export function parseSmsPayload(text: string): ParsedTx {
  return _parse(text);
}

