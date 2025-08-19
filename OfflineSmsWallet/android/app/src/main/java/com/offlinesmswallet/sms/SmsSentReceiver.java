package com.offlinesmswallet.sms;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import com.facebook.react.ReactApplication;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class SmsSentReceiver extends BroadcastReceiver {
  @Override
  public void onReceive(Context context, Intent intent) {
    ReactApplication app = (ReactApplication) context.getApplicationContext();
    if (app.getReactNativeHost().getReactInstanceManager().getCurrentReactContext() != null) {
      var reactContext = app.getReactNativeHost().getReactInstanceManager().getCurrentReactContext();
      var params = Arguments.createMap();
      params.putString("requestId", intent.getStringExtra("requestId"));
      params.putInt("resultCode", getResultCode());
      reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("WALLET_SMS_SENT", params);
    }
  }
}

