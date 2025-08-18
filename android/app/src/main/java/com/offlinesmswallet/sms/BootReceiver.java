package com.offlinesmswallet.sms;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import androidx.work.OneTimeWorkRequest;
import androidx.work.WorkManager;

public class BootReceiver extends BroadcastReceiver {
    
    @Override
    public void onReceive(Context context, Intent intent) {
        if (Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction())) {
            // Schedule retry worker for any pending SMS
            OneTimeWorkRequest retryWork = new OneTimeWorkRequest.Builder(SmsRetryWorker.class)
                .build();
            
            WorkManager.getInstance(context).enqueue(retryWork);
        }
    }
}