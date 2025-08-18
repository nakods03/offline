import 'react-native-get-random-values';
import '@testing-library/jest-native/extend-expect';

// Mock react-native modules
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  
  return {
    ...RN,
    NativeModules: {
      ...RN.NativeModules,
      SmsSender: {
        sendSms: jest.fn().mockResolvedValue('SMS_QUEUED'),
      },
    },
    DeviceEventEmitter: {
      addListener: jest.fn(),
      removeListener: jest.fn(),
    },
  };
});

// Mock react-native-keychain
jest.mock('react-native-keychain', () => ({
  setInternetCredentials: jest.fn().mockResolvedValue(true),
  getInternetCredentials: jest.fn().mockResolvedValue({ username: 'test', password: 'test' }),
  resetInternetCredentials: jest.fn().mockResolvedValue(true),
  ACCESS_CONTROL: {
    BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE: 'BiometryCurrentSetOrDevicePasscode',
  },
  AUTHENTICATION_TYPE: {
    DEVICE_PASSCODE_OR_BIOMETRICS: 'DevicePasscodeOrBiometrics',
  },
}));

// Mock react-native-device-info
jest.mock('react-native-device-info', () => ({
  getUniqueId: jest.fn().mockResolvedValue('test-device-id'),
}));

// Mock Realm
jest.mock('realm', () => {
  const mockRealm = {
    write: jest.fn((callback) => callback()),
    create: jest.fn(),
    objects: jest.fn().mockReturnValue([]),
    objectForPrimaryKey: jest.fn(),
    delete: jest.fn(),
    close: jest.fn(),
    isClosed: false,
  };
  
  return {
    __esModule: true,
    default: {
      open: jest.fn().mockResolvedValue(mockRealm),
    },
  };
});

// Mock react-native-permissions
jest.mock('react-native-permissions', () => ({
  check: jest.fn().mockResolvedValue('granted'),
  request: jest.fn().mockResolvedValue('granted'),
  PERMISSIONS: {
    ANDROID: {
      SEND_SMS: 'android.permission.SEND_SMS',
      RECEIVE_SMS: 'android.permission.RECEIVE_SMS',
      READ_SMS: 'android.permission.READ_SMS',
      CAMERA: 'android.permission.CAMERA',
    },
    IOS: {
      CAMERA: 'ios.permission.CAMERA',
    },
  },
  RESULTS: {
    GRANTED: 'granted',
    DENIED: 'denied',
    BLOCKED: 'blocked',
  },
}));

// Mock Firebase
jest.mock('@react-native-firebase/app', () => ({
  __esModule: true,
  default: () => ({
    auth: () => ({
      signInAnonymously: jest.fn().mockResolvedValue({ user: { uid: 'test-uid' } }),
      currentUser: { uid: 'test-uid' },
      signOut: jest.fn().mockResolvedValue(undefined),
    }),
  }),
}));

jest.mock('@react-native-firebase/auth', () => ({
  __esModule: true,
  default: () => ({
    signInAnonymously: jest.fn().mockResolvedValue({ user: { uid: 'test-uid' } }),
    currentUser: { uid: 'test-uid' },
    signOut: jest.fn().mockResolvedValue(undefined),
  }),
}));

jest.mock('@react-native-firebase/firestore', () => ({
  __esModule: true,
  default: () => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        collection: jest.fn(() => ({
          doc: jest.fn(() => ({
            set: jest.fn().mockResolvedValue(undefined),
            get: jest.fn().mockResolvedValue({ docs: [] }),
            delete: jest.fn().mockResolvedValue(undefined),
          })),
        })),
      })),
    })),
  }),
}));

jest.mock('@react-native-firebase/storage', () => ({
  __esModule: true,
  default: () => ({
    ref: jest.fn(() => ({
      putString: jest.fn().mockResolvedValue(undefined),
      getDownloadURL: jest.fn().mockResolvedValue('https://test-url.com'),
      delete: jest.fn().mockResolvedValue(undefined),
    })),
  }),
}));

// Mock react-native-vision-camera
jest.mock('react-native-vision-camera', () => ({
  Camera: 'Camera',
  useCameraDevices: jest.fn(() => ({ back: { id: 'back' } })),
  useCodeScanner: jest.fn(() => ({})),
}));

// Mock react-native-qrcode-svg
jest.mock('react-native-qrcode-svg', () => 'QRCode');

// Mock react-native-linear-gradient
jest.mock('react-native-linear-gradient', () => 'LinearGradient');

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native/Libraries/Components/View/View');
  return {
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    ScrollView: View,
    Slider: View,
    Switch: View,
    TextInput: View,
    ToolbarAndroid: View,
    ViewPagerAndroid: View,
    DrawerLayoutAndroid: View,
    WebView: View,
    NativeViewGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    ForceTouchGestureHandler: View,
    LongPressGestureHandler: View,
    PanGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
    RawButton: View,
    BaseButton: View,
    RectButton: View,
    BorderlessButton: View,
    FlatList: View,
    gestureHandlerRootHOC: jest.fn(),
    Directions: {},
    GestureHandlerRootView: View,
  };
});

// Silence console warnings in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};