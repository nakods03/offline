# Offline SMS Wallet

A React Native mobile application that enables peer-to-peer money transfers via SMS, working completely offline. Built with TypeScript, featuring end-to-end encryption, PIN security, and optional cloud backup.

## Features

### 🔒 **Security First**
- **Ed25519 Digital Signatures**: All transactions are cryptographically signed
- **PIN Protection**: 4-digit PIN with auto-lock functionality
- **Encrypted Storage**: Local data encrypted with device keystore/keychain
- **Replay Protection**: Nonce-based transaction deduplication
- **Timestamp Validation**: 15-minute window for transaction acceptance

### 📱 **SMS-Based Transactions**
- **Offline Operation**: Send/receive money without internet connection
- **Structured Protocol**: Custom SMS format with version control
- **Multi-part Support**: Handles long messages automatically
- **Delivery Tracking**: Real-time status updates (Sent/Delivered/Applied)
- **Automatic Retry**: Failed transactions are retried with exponential backoff

### 🎯 **User Experience**
- **Modern UI**: Clean, intuitive interface with smooth animations
- **QR Code Pairing**: Easy contact exchange via QR scanning
- **Contact Management**: Trusted contacts for automatic verification
- **Transaction History**: Complete audit trail with filtering
- **Permission Management**: Graceful handling of SMS/camera permissions

### ☁️ **Optional Cloud Features**
- **Encrypted Backup**: End-to-end encrypted wallet backups
- **Cross-Device Sync**: Restore wallet on new devices
- **Firebase Integration**: Secure cloud storage with anonymous auth

## Architecture

### **Tech Stack**
- **React Native CLI** with TypeScript
- **Zustand** for state management
- **Realm** for encrypted local database
- **tweetnacl** for Ed25519 cryptography
- **React Navigation** for routing
- **React Native Reanimated** for animations

### **Native Components**
- **Android SMS Integration**: Custom native modules for SMS handling
- **iOS Fallback**: Manual SMS composer (limited functionality)
- **Secure Storage**: react-native-keychain integration
- **Camera/QR**: react-native-vision-camera for QR scanning

### **SMS Protocol**
```
WLT1|TX|<txid>|from:<E164>|to:<E164>|amt:<number>|ts:<epoch>|n:<8hex>|m:<urlenc>|sig:<b64url>
```

**Components:**
- `WLT1`: Protocol version
- `TX`: Transaction type
- `txid`: UUID transaction ID
- `from/to`: E.164 phone numbers
- `amt`: Decimal amount (USD)
- `ts`: Unix timestamp
- `n`: Random nonce (hex)
- `m`: URL-encoded memo (optional)
- `sig`: Ed25519 signature (base64url)

## Setup Instructions

### **Prerequisites**
- Node.js 16+
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development)

### **Installation**

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd offline-sms-wallet
   npm install
   ```

2. **Android Setup**
   ```bash
   cd android
   ./gradlew clean
   cd ..
   npx react-native run-android
   ```

3. **iOS Setup** (Limited functionality)
   ```bash
   cd ios
   pod install
   cd ..
   npx react-native run-ios
   ```

### **Firebase Setup (Optional)**

1. Create a Firebase project
2. Enable Anonymous Authentication
3. Set up Firestore and Storage
4. Add configuration files:
   - `android/app/google-services.json`
   - `ios/GoogleService-Info.plist`

### **Building Release APK**

1. **Generate Keystore**
   ```bash
   cd android/app
   keytool -genkeypair -v -storetype PKCS12 -keystore release.keystore -alias release -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Configure Signing**
   
   Add to `android/gradle.properties`:
   ```properties
   RELEASE_STORE_FILE=release.keystore
   RELEASE_KEY_ALIAS=release
   RELEASE_STORE_PASSWORD=your_password
   RELEASE_KEY_PASSWORD=your_password
   ```

3. **Build APK**
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

   APK location: `android/app/build/outputs/apk/release/app-release.apk`

## Usage Guide

### **First Time Setup**
1. **Phone Number**: Enter your E.164 formatted phone number
2. **Create PIN**: Set a 4-digit security PIN
3. **Generate Keys**: App creates your cryptographic keypair
4. **Share QR**: Show your QR code to potential senders

### **Sending Money**
1. Enter recipient's phone number or scan their QR
2. Specify amount and optional memo
3. Confirm transaction details
4. Enter PIN to authorize
5. SMS sent automatically with transaction data

### **Receiving Money**
1. Share your QR code or phone number
2. Incoming SMS transactions processed automatically
3. Verified transactions credit your balance immediately
4. Unverified transactions require manual trust

### **Security Best Practices**
- **PIN Security**: Choose a unique PIN, don't share it
- **QR Sharing**: Only scan QR codes from trusted sources
- **Backup**: Regularly backup your wallet with a strong passphrase
- **Permissions**: Grant SMS permissions for full functionality

## Compliance & Legal

### **Google Play Store**
⚠️ **Important**: Google Play heavily restricts SMS permissions for non-default SMS apps. This app is designed for:
- Enterprise/internal distribution
- Sideloading for testing
- Jurisdictions where SMS apps are permitted
- Development and educational purposes

### **Limited Mode**
For public app stores, the app includes a "Limited Mode" that:
- Uses manual SMS composer instead of automatic sending
- Disables automatic SMS reading
- Maintains full security and encryption features

## Development

### **Project Structure**
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI elements
│   └── security/       # Security-related components
├── screens/            # App screens
│   └── onboarding/     # Onboarding flow
├── navigation/         # Navigation configuration
├── state/              # Zustand stores
├── db/                 # Realm models and config
├── crypto/             # Cryptographic functions
├── sms/                # SMS protocol and bridge
├── qr/                 # QR generation and scanning
├── cloud/              # Firebase integration
├── theme/              # Design system
└── types/              # TypeScript definitions

android/
└── app/src/main/java/com/offlinesmswallet/
    └── sms/            # Native SMS modules
```

### **Testing**
```bash
# Run unit tests
npm test

# Run with coverage
npm test -- --coverage

# Android instrumented tests
cd android
./gradlew connectedAndroidTest
```

### **Code Quality**
```bash
# Lint code
npm run lint

# Type checking
npm run type-check

# Format code
npx prettier --write src/
```

## Security Considerations

### **Cryptographic Security**
- **Ed25519**: Industry-standard elliptic curve signatures
- **Key Storage**: Private keys encrypted in device secure storage
- **Nonce Protection**: Prevents replay attacks
- **Timestamp Windows**: Limits transaction validity period

### **Data Protection**
- **Realm Encryption**: Database encrypted with 64-byte key
- **PIN Hashing**: PINs hashed before storage
- **Backup Encryption**: Cloud backups encrypted with user passphrase
- **Memory Safety**: Sensitive data cleared after use

### **Network Security**
- **Offline Operation**: No network required for core functionality
- **Anonymous Auth**: Firebase uses anonymous authentication
- **E2E Encryption**: Backup data encrypted client-side

## Limitations

### **Current Limitations**
- **Android Only**: Full SMS functionality requires Android
- **SMS Costs**: Standard SMS rates apply
- **No Blockchain**: Balances are local, not on a distributed ledger
- **Trust Model**: Requires manual contact verification
- **SMS Length**: Complex transactions may exceed SMS limits

### **Future Enhancements**
- **Multi-Currency Support**: Support for different currencies
- **Contact Integration**: Phone book integration
- **Advanced Crypto**: Support for other signature algorithms
- **Reconciliation**: Automated balance reconciliation
- **Merchant Features**: QR-based merchant payments

## Support

### **Troubleshooting**
- **SMS Not Sending**: Check SMS permissions and network coverage
- **QR Scanner Issues**: Verify camera permissions
- **PIN Forgotten**: Use backup restore if available
- **Balance Mismatch**: Check transaction history for failed transactions

### **Getting Help**
- Check the GitHub issues for common problems
- Review logs using `npx react-native log-android`
- Test SMS functionality with debug builds first

## License

This project is provided as-is for educational and development purposes. Please ensure compliance with local regulations regarding SMS applications and financial software before deployment.

---

**⚠️ Disclaimer**: This is a demonstration application. Use in production environments requires additional security auditing, regulatory compliance, and proper key management infrastructure.