# Offline SMS Wallet

Offline-first mobile wallet that moves value between peers using signed SMS messages. Built with React Native and TypeScript.

## Features

- Fully offline transaction flow via structured SMS
- Encrypted local storage (Realm) secured by OS key store
- PIN lock & auto-lock for security
- QR pairing for key exchange
- Optional encrypted Firebase backup/restore
- Modern UI built with NativeWind utility classes

## Prerequisites

- Node.js ≥ 18
- Yarn (recommended) or npm
- Java 17 & Android SDK (API 33+)
- Xcode 14+ and CocoaPods (for iOS limited mode)

## Getting Started

```bash
# clone repository
$ git clone <repo-url> offline-sms-wallet
$ cd offline-sms-wallet

# install dependencies
yarn install  # or npm install
```

### Run on Android (Debug)

```bash
yarn android
```

### Run on iOS (Debug)

```bash
cd ios && pod install && cd ..
yarn ios
```

### Release APK

```bash
cd android
./gradlew assembleRelease
```

Copy your keystore to `android/app` and configure `gradle.properties` as per React Native signing docs.

## Project Structure

```
/android         # Native modules & receivers
/ios             # iOS build (limited SMS support)
/src
  /components    # Reusable UI components
  /screens       # Screen components
  /navigation    # Navigation stack
  /state         # Zustand stores
  /db            # Realm models & config
  /crypto        # Crypto helpers (sign, verify, backup)
  /sms           # SMS parser, payload builder, retry worker
  /qr            # QR generate & scan helpers
  /utils         # Misc utilities & polyfills
  /theme         # Color palettes & typography
App.tsx          # Entry point
```

## License

MIT