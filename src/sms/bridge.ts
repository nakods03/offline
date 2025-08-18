import { NativeModules, DeviceEventEmitter, Platform } from 'react-native';
import { SmsError, SmsEvent, IncomingSmsEvent } from '@/types';

// Native SMS sender module
interface SmsSenderModule {
  sendSms(phoneNumber: string, message: string, requestId: string): Promise<string>;
}

const { SmsSender } = NativeModules as { SmsSender: SmsSenderModule };

// SMS Bridge wrapper for cross-platform compatibility
export class SmsBridge {
  private static instance: SmsBridge;
  private listeners: Map<string, (event: any) => void> = new Map();

  static getInstance(): SmsBridge {
    if (!SmsBridge.instance) {
      SmsBridge.instance = new SmsBridge();
    }
    return SmsBridge.instance;
  }

  private constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Listen for SMS sent events
    DeviceEventEmitter.addListener('WALLET_SMS_SENT', (event: SmsEvent) => {
      const callback = this.listeners.get(`sent_${event.requestId}`);
      if (callback) {
        callback(event);
      }
    });

    // Listen for SMS delivered events
    DeviceEventEmitter.addListener('WALLET_SMS_DELIVERED', (event: SmsEvent) => {
      const callback = this.listeners.get(`delivered_${event.requestId}`);
      if (callback) {
        callback(event);
      }
    });

    // Listen for incoming SMS events
    DeviceEventEmitter.addListener('WALLET_SMS_INCOMING', (event: IncomingSmsEvent) => {
      const callback = this.listeners.get('incoming');
      if (callback) {
        callback(event);
      }
    });

    // Listen for retry worker events
    DeviceEventEmitter.addListener('WALLET_SMS_RETRY', (event: any) => {
      const callback = this.listeners.get('retry');
      if (callback) {
        callback(event);
      }
    });
  }

  // Send SMS
  async sendSms(phoneNumber: string, message: string, requestId: string): Promise<void> {
    if (Platform.OS !== 'android') {
      throw new SmsError('SMS sending only supported on Android');
    }

    if (!SmsSender) {
      throw new SmsError('SMS sender module not available');
    }

    try {
      await SmsSender.sendSms(phoneNumber, message, requestId);
    } catch (error) {
      throw new SmsError('Failed to send SMS', error);
    }
  }

  // Register callback for SMS sent events
  onSmsSent(requestId: string, callback: (event: SmsEvent) => void): () => void {
    const key = `sent_${requestId}`;
    this.listeners.set(key, callback);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(key);
    };
  }

  // Register callback for SMS delivered events
  onSmsDelivered(requestId: string, callback: (event: SmsEvent) => void): () => void {
    const key = `delivered_${requestId}`;
    this.listeners.set(key, callback);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(key);
    };
  }

  // Register callback for incoming SMS events
  onIncomingSms(callback: (event: IncomingSmsEvent) => void): () => void {
    this.listeners.set('incoming', callback);

    // Return unsubscribe function
    return () => {
      this.listeners.delete('incoming');
    };
  }

  // Register callback for retry events
  onRetry(callback: (event: any) => void): () => void {
    this.listeners.set('retry', callback);

    // Return unsubscribe function
    return () => {
      this.listeners.delete('retry');
    };
  }

  // Clear all listeners
  clearAllListeners(): void {
    this.listeners.clear();
  }
}

// Singleton instance
export const smsBridge = SmsBridge.getInstance();