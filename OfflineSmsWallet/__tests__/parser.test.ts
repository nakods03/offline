import { buildSmsPayload, parseSmsPayload } from '../src/sms/payload';

test('build and parse payload without memo', () => {
  const { text } = buildSmsPayload({ to: '+15550001234', amountCents: 1234 }, { phoneE164: '+15550009999', publicKeyB64: 'PUB' });
  expect(text.startsWith('WLT1|TX|')).toBe(true);
  const sigAppended = text + 'AA';
  const parsed = parseSmsPayload(sigAppended);
  expect(parsed.from).toBe('+15550009999');
  expect(parsed.to).toBe('+15550001234');
});

