import {NativeModules, NativeEventEmitter, EmitterSubscription} from 'react-native';

export type SmsSentEvent = { requestId?: string; resultCode?: number; errorCode?: number };
export type SmsDeliveredEvent = { requestId?: string; resultCode?: number };
export type SmsIncomingEvent = { raw: string };

const { SmsSenderModule } = NativeModules as any;

export const WALLET_SMS_SENT = 'WALLET_SMS_SENT';
export const WALLET_SMS_DELIVERED = 'WALLET_SMS_DELIVERED';
export const WALLET_SMS_INCOMING = 'WALLET_SMS_INCOMING';

const eventEmitter = new NativeEventEmitter(NativeModules.SmsSenderModule);

export function sendSms(phone: string, message: string, requestId: string) {
  return SmsSenderModule.send(phone, message, requestId);
}

export function subscribeSent(listener: (e: SmsSentEvent) => void): EmitterSubscription {
  return eventEmitter.addListener(WALLET_SMS_SENT, listener);
}

export function subscribeDelivered(listener: (e: SmsDeliveredEvent) => void): EmitterSubscription {
  return eventEmitter.addListener(WALLET_SMS_DELIVERED, listener);
}

export function subscribeIncoming(listener: (e: SmsIncomingEvent) => void): EmitterSubscription {
  return eventEmitter.addListener(WALLET_SMS_INCOMING, listener);
}

