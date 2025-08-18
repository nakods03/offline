package com.offlinesmswallet.sms;

import com.facebook.react.bridge.ReactApplicationContext;

public class SmsEventEmitter {
    private static ReactApplicationContext reactContext;
    
    public static void setReactContext(ReactApplicationContext context) {
        reactContext = context;
    }
    
    public static ReactApplicationContext getReactContext() {
        return reactContext;
    }
}