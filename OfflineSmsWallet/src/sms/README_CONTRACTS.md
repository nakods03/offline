Key contracts implemented

- buildSmsPayload(tx, sender): returns { text, txid }
- parseSmsPayload(text): ParsedTx
- sign(payload): via src/crypto/ed25519.ts
- verify(payload, sig, pubKey)
- applyOutgoing(txid) and applyIncoming(parsed): via src/state/wallet.ts
- scheduleRetry(txid): src/sms/retryWorker.ts

