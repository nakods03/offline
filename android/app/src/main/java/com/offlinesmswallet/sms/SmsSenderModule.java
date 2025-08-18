package com.offlinesmswallet.sms;

import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.telephony.SmsManager;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import java.util.ArrayList;

public class SmsSenderModule extends ReactContextBaseJavaModule {
    private static final String MODULE_NAME = "SmsSender";
    private final ReactApplicationContext reactContext;

    public SmsSenderModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return MODULE_NAME;
    }

    @ReactMethod
    public void sendSms(String phoneNumber, String message, String requestId, Promise promise) {
        try {
            SmsManager smsManager = SmsManager.getDefault();
            
            // Create pending intents for sent and delivered
            Intent sentIntent = new Intent("com.wallet.SMS_SENT");
            sentIntent.putExtra("requestId", requestId);
            sentIntent.putExtra("phoneNumber", phoneNumber);
            
            Intent deliveredIntent = new Intent("com.wallet.SMS_DELIVERED");
            deliveredIntent.putExtra("requestId", requestId);
            deliveredIntent.putExtra("phoneNumber", phoneNumber);

            PendingIntent sentPendingIntent = PendingIntent.getBroadcast(
                reactContext, 
                requestId.hashCode(), 
                sentIntent, 
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );
            
            PendingIntent deliveredPendingIntent = PendingIntent.getBroadcast(
                reactContext, 
                requestId.hashCode() + 1000, 
                deliveredIntent, 
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );

            // Check if message needs to be split
            if (message.length() > 160) {
                ArrayList<String> parts = smsManager.divideMessage(message);
                ArrayList<PendingIntent> sentIntents = new ArrayList<>();
                ArrayList<PendingIntent> deliveredIntents = new ArrayList<>();
                
                for (int i = 0; i < parts.size(); i++) {
                    sentIntents.add(sentPendingIntent);
                    deliveredIntents.add(deliveredPendingIntent);
                }
                
                smsManager.sendMultipartTextMessage(
                    phoneNumber, 
                    null, 
                    parts, 
                    sentIntents, 
                    deliveredIntents
                );
            } else {
                smsManager.sendTextMessage(
                    phoneNumber, 
                    null, 
                    message, 
                    sentPendingIntent, 
                    deliveredPendingIntent
                );
            }
            
            promise.resolve("SMS_QUEUED");
        } catch (Exception e) {
            promise.reject("SMS_ERROR", e.getMessage());
        }
    }
}