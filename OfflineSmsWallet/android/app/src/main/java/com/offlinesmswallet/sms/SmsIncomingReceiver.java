package com.offlinesmswallet.sms;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.provider.Telephony;
import com.facebook.react.ReactApplication;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class SmsIncomingReceiver extends BroadcastReceiver {
  @Override
  public void onReceive(Context context, Intent intent) {
    var app = (ReactApplication) context.getApplicationContext();
    var reactContext = app.getReactNativeHost().getReactInstanceManager().getCurrentReactContext();
    if (reactContext == null) return;
    var messages = Telephony.Sms.Intents.getMessagesFromIntent(intent);
    var body = new StringBuilder();
    for (var msg : messages) body.append(msg.getMessageBody());
    var raw = body.toString();
    if (raw.startsWith("WLT1|TX|")) {
      var params = Arguments.createMap();
      params.putString("raw", raw);
      reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("WALLET_SMS_INCOMING", params);
    }
  }
}

