export type { ParsedTx } from './protocol';
export type DraftTx = {
  to: string;
  amountCents: number;
  memo?: string;
};

