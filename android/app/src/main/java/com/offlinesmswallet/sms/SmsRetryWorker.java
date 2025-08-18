package com.offlinesmswallet.sms;

import android.content.Context;
import androidx.annotation.NonNull;
import androidx.work.Worker;
import androidx.work.WorkerParameters;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class SmsRetryWorker extends Worker {
    
    public SmsRetryWorker(@NonNull Context context, @NonNull WorkerParameters params) {
        super(context, params);
    }
    
    @NonNull
    @Override
    public Result doWork() {
        try {
            // Notify React Native that retry worker is running
            WritableMap params = Arguments.createMap();
            params.putString("action", "RETRY_WORKER_STARTED");
            params.putLong("timestamp", System.currentTimeMillis());
            
            ReactApplicationContext reactContext = SmsEventEmitter.getReactContext();
            if (reactContext != null && reactContext.hasActiveCatalystInstance()) {
                reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("WALLET_SMS_RETRY", params);
            }
            
            return Result.success();
        } catch (Exception e) {
            return Result.failure();
        }
    }
}