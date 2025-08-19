package com.offlinesmswallet.sms;

import android.app.PendingIntent;
import android.content.Intent;
import android.telephony.SmsManager;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.util.ArrayList;

public class SmsSenderModule extends ReactContextBaseJavaModule {
  private final ReactApplicationContext reactContext;

  public SmsSenderModule(ReactApplicationContext context) {
    super(context);
    this.reactContext = context;
  }

  @Override
  public String getName() {
    return "SmsSenderModule";
  }

  @ReactMethod
  public void send(String phone, String message, String requestId, Promise promise) {
    try {
      Intent sentIntent = new Intent("com.offlinesmswallet.WALLET_SMS_SENT");
      sentIntent.putExtra("requestId", requestId);
      Intent deliveredIntent = new Intent("com.offlinesmswallet.WALLET_SMS_DELIVERED");
      deliveredIntent.putExtra("requestId", requestId);

      int flags = PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_MUTABLE;
      PendingIntent sentPI = PendingIntent.getBroadcast(reactContext, requestId.hashCode(), sentIntent, flags);
      PendingIntent deliveredPI = PendingIntent.getBroadcast(reactContext, requestId.hashCode()+1, deliveredIntent, flags);

      SmsManager sms = SmsManager.getDefault();
      ArrayList<String> parts = sms.divideMessage(message);
      if (parts.size() > 1) {
        ArrayList<PendingIntent> sentPIs = new ArrayList<>();
        ArrayList<PendingIntent> deliveredPIs = new ArrayList<>();
        for (int i = 0; i < parts.size(); i++) { sentPIs.add(sentPI); deliveredPIs.add(deliveredPI); }
        sms.sendMultipartTextMessage(phone, null, parts, sentPIs, deliveredPIs);
      } else {
        sms.sendTextMessage(phone, null, message, sentPI, deliveredPI);
      }
      promise.resolve(null);
    } catch (Exception e) {
      promise.reject("SMS_ERROR", e);
    }
  }
}

