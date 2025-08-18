package com.offlinesmswallet.sms;

import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class SmsDeliveredReceiver extends BroadcastReceiver {
    
    @Override
    public void onReceive(Context context, Intent intent) {
        String requestId = intent.getStringExtra("requestId");
        String phoneNumber = intent.getStringExtra("phoneNumber");
        
        WritableMap params = Arguments.createMap();
        params.putString("requestId", requestId);
        params.putString("phoneNumber", phoneNumber);
        params.putLong("timestamp", System.currentTimeMillis());
        
        if (getResultCode() == Activity.RESULT_OK) {
            params.putString("status", "DELIVERED");
            params.putString("message", "SMS delivered successfully");
        } else {
            params.putString("status", "DELIVERY_FAILED");
            params.putString("message", "SMS delivery failed");
            params.putInt("errorCode", getResultCode());
        }
        
        // Send event to React Native
        try {
            ReactApplicationContext reactContext = SmsEventEmitter.getReactContext();
            if (reactContext != null && reactContext.hasActiveCatalystInstance()) {
                reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("WALLET_SMS_DELIVERED", params);
            }
        } catch (Exception e) {
            // Context not available, ignore
        }
    }
}