# Offline SMS Wallet (Android-first, RN + TypeScript)

This app demonstrates a peer-to-peer wallet that transacts via signed SMS, designed to operate completely offline for normal use. Android has full automation (send/receive). iOS builds in limited mode (no auto-read).

## Quick start

1) Prereqs
- Node 18+
- Android Studio with SDK 34

2) Install
```bash
npm install
```

3) Android debug build
```bash
npm run android
```

4) Build release APK
```bash
cd android && ./gradlew assembleRelease
```

## Permissions
- SEND_SMS, RECEIVE_SMS, READ_SMS, RECEIVE_BOOT_COMPLETED are declared and requested at runtime.

Compliance note: Google Play restricts SMS permissions for non-default SMS apps. This build targets sideloading/enterprise pilots. Provide a "Limited mode" for stores.

## What’s included
- Native Android SMS sender + receivers (SENT, DELIVERED, SMS_RECEIVED)
- TypeScript modules: crypto (Ed25519 sign/verify), SMS protocol builder/parser, Realm models, Zustand state
- Minimal navigator scaffold; request runtime SMS permissions on launch
- Jest unit test for parser

## Build tips
- Min SDK 24, target SDK 34
- If build errors arise from NDK/SDK versions, sync them with your local installation in `android/build.gradle`