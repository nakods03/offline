import { generateKeypair, sign, verify } from '../src/crypto';

test('sign and verify', () => {
  const { publicKeyB64, privateKeyB64 } = generateKeypair();
  const msg = 'WLT1|TX|example|from:+100|to:+200|amt:1.00|ts:1|n:abcd|sig:';
  const sig = sign(msg, privateKeyB64);
  expect(verify(msg, sig, publicKeyB64)).toBe(true);
});

