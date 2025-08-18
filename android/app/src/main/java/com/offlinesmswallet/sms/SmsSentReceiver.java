package com.offlinesmswallet.sms;

import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.telephony.SmsManager;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class SmsSentReceiver extends BroadcastReceiver {
    
    @Override
    public void onReceive(Context context, Intent intent) {
        String requestId = intent.getStringExtra("requestId");
        String phoneNumber = intent.getStringExtra("phoneNumber");
        
        WritableMap params = Arguments.createMap();
        params.putString("requestId", requestId);
        params.putString("phoneNumber", phoneNumber);
        params.putLong("timestamp", System.currentTimeMillis());
        
        switch (getResultCode()) {
            case Activity.RESULT_OK:
                params.putString("status", "SENT");
                params.putString("message", "SMS sent successfully");
                break;
            case SmsManager.RESULT_ERROR_GENERIC_FAILURE:
                params.putString("status", "FAILED_TEMP");
                params.putString("message", "Generic failure");
                params.putInt("errorCode", SmsManager.RESULT_ERROR_GENERIC_FAILURE);
                break;
            case SmsManager.RESULT_ERROR_NO_SERVICE:
                params.putString("status", "FAILED_TEMP");
                params.putString("message", "No service");
                params.putInt("errorCode", SmsManager.RESULT_ERROR_NO_SERVICE);
                break;
            case SmsManager.RESULT_ERROR_NULL_PDU:
                params.putString("status", "FAILED_PERM");
                params.putString("message", "Null PDU");
                params.putInt("errorCode", SmsManager.RESULT_ERROR_NULL_PDU);
                break;
            case SmsManager.RESULT_ERROR_RADIO_OFF:
                params.putString("status", "FAILED_TEMP");
                params.putString("message", "Radio off");
                params.putInt("errorCode", SmsManager.RESULT_ERROR_RADIO_OFF);
                break;
            default:
                params.putString("status", "FAILED_TEMP");
                params.putString("message", "Unknown error");
                params.putInt("errorCode", getResultCode());
                break;
        }
        
        // Send event to React Native
        try {
            ReactApplicationContext reactContext = SmsEventEmitter.getReactContext();
            if (reactContext != null && reactContext.hasActiveCatalystInstance()) {
                reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("WALLET_SMS_SENT", params);
            }
        } catch (Exception e) {
            // Context not available, ignore
        }
    }
}