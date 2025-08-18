package com.offlinesmswallet.sms;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.telephony.SmsMessage;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class SmsIncomingReceiver extends BroadcastReceiver {
    
    @Override
    public void onReceive(Context context, Intent intent) {
        Bundle bundle = intent.getExtras();
        if (bundle == null) return;
        
        Object[] pdus = (Object[]) bundle.get("pdus");
        if (pdus == null) return;
        
        StringBuilder messageBody = new StringBuilder();
        String senderPhone = null;
        long timestamp = 0;
        
        for (Object pdu : pdus) {
            SmsMessage smsMessage = SmsMessage.createFromPdu((byte[]) pdu);
            if (smsMessage != null) {
                if (senderPhone == null) {
                    senderPhone = smsMessage.getOriginatingAddress();
                    timestamp = smsMessage.getTimestampMillis();
                }
                messageBody.append(smsMessage.getMessageBody());
            }
        }
        
        String fullMessage = messageBody.toString();
        
        // Check if this is a wallet SMS (starts with WLT1|TX|)
        if (fullMessage.startsWith("WLT1|TX|")) {
            WritableMap params = Arguments.createMap();
            params.putString("raw", fullMessage);
            params.putString("senderPhone", senderPhone);
            params.putLong("timestamp", timestamp);
            params.putLong("receivedAt", System.currentTimeMillis());
            
            // Send event to React Native
            try {
                ReactApplicationContext reactContext = SmsEventEmitter.getReactContext();
                if (reactContext != null && reactContext.hasActiveCatalystInstance()) {
                    reactContext
                        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                        .emit("WALLET_SMS_INCOMING", params);
                }
            } catch (Exception e) {
                // Context not available, ignore
            }
        }
    }
}