import { useEffect } from 'react';
import { subscribeIncoming, subscribeDelivered, subscribeSent, WALLET_SMS_INCOMING } from './bridge';

export function useSmsEvents(onIncoming: (raw: string) => void) {
  useEffect(() => {
    const s1 = subscribeIncoming(e => onIncoming(e.raw));
    const s2 = subscribeSent(() => {});
    const s3 = subscribeDelivered(() => {});
    return () => {
      s1.remove(); s2.remove(); s3.remove();
    };
  }, [onIncoming]);
}

