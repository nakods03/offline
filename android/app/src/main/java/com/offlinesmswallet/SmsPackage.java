package com.offlinesmswallet;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;
import com.offlinesmswallet.sms.SmsSenderModule;
import com.offlinesmswallet.sms.SmsEventEmitter;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class SmsPackage implements ReactPackage {

    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        return Collections.emptyList();
    }

    @Override
    public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
        // Set the react context for event emitter
        SmsEventEmitter.setReactContext(reactContext);
        
        List<NativeModule> modules = new ArrayList<>();
        modules.add(new SmsSenderModule(reactContext));
        return modules;
    }
}