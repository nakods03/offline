import { create } from 'zustand';
import { Settings, PermissionState } from '@/types';
import { getRealm, dbWrite, dbRead } from '@/db/realm';
import { SettingsSchema } from '@/db/models';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { Platform } from 'react-native';

interface SettingsState extends Settings {
  // Additional state
  permissions: PermissionState;
  
  // Actions
  loadSettings: () => Promise<void>;
  updateSettings: (updates: Partial<Settings>) => void;
  setCloudEnabled: (enabled: boolean) => void;
  setAutoLockMs: (ms: number) => void;
  updateLastBackup: () => void;
  
  // Permissions
  checkPermissions: () => Promise<void>;
  requestSmsPermissions: () => Promise<boolean>;
  requestCameraPermission: () => Promise<boolean>;
}

const getPermissionKey = (permission: string) => {
  if (Platform.OS === 'android') {
    switch (permission) {
      case 'sms':
        return [PERMISSIONS.ANDROID.SEND_SMS, PERMISSIONS.ANDROID.RECEIVE_SMS, PERMISSIONS.ANDROID.READ_SMS];
      case 'camera':
        return PERMISSIONS.ANDROID.CAMERA;
      default:
        return null;
    }
  } else {
    // iOS permissions would go here
    switch (permission) {
      case 'camera':
        return PERMISSIONS.IOS.CAMERA;
      default:
        return null;
    }
  }
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  // Initial state
  id: 'default',
  autoLockMs: 30000,
  cloudEnabled: false,
  permissions: {
    sms: false,
    camera: false,
  },

  // Actions
  loadSettings: async () => {
    try {
      const settings = dbRead(() => {
        const realm = getRealm();
        return realm.objectForPrimaryKey('Settings', 'default') as SettingsSchema;
      });

      if (settings) {
        set({
          id: settings.id,
          autoLockMs: settings.autoLockMs,
          lastLockAt: settings.lastLockAt || undefined,
          cloudEnabled: settings.cloudEnabled,
          lastBackupAt: settings.lastBackupAt || undefined,
        });
      } else {
        // Create default settings
        const defaultSettings: Settings = {
          id: 'default',
          autoLockMs: 30000,
          cloudEnabled: false,
        };

        dbWrite(() => {
          const realm = getRealm();
          realm.create('Settings', {
            id: defaultSettings.id,
            autoLockMs: defaultSettings.autoLockMs,
            cloudEnabled: defaultSettings.cloudEnabled,
          });
        });

        set(defaultSettings);
      }

      // Check permissions after loading settings
      await get().checkPermissions();
    } catch (error) {
      console.error('Failed to load settings:', error);
      throw error;
    }
  },

  updateSettings: (updates) => {
    try {
      // Update database
      dbWrite(() => {
        const realm = getRealm();
        const settings = realm.objectForPrimaryKey('Settings', 'default') as SettingsSchema;
        if (settings) {
          if (updates.autoLockMs !== undefined) settings.autoLockMs = updates.autoLockMs;
          if (updates.cloudEnabled !== undefined) settings.cloudEnabled = updates.cloudEnabled;
          if (updates.lastLockAt !== undefined) settings.lastLockAt = updates.lastLockAt;
          if (updates.lastBackupAt !== undefined) settings.lastBackupAt = updates.lastBackupAt;
        }
      });

      // Update local state
      set(updates);
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    }
  },

  setCloudEnabled: (enabled) => {
    get().updateSettings({ cloudEnabled: enabled });
  },

  setAutoLockMs: (ms) => {
    get().updateSettings({ autoLockMs: ms });
  },

  updateLastBackup: () => {
    get().updateSettings({ lastBackupAt: new Date() });
  },

  // Permissions
  checkPermissions: async () => {
    try {
      const permissions: PermissionState = {
        sms: false,
        camera: false,
      };

      if (Platform.OS === 'android') {
        // Check SMS permissions
        const smsPermissions = getPermissionKey('sms') as string[];
        const smsResults = await Promise.all(
          smsPermissions.map(permission => check(permission as any))
        );
        permissions.sms = smsResults.every(result => result === RESULTS.GRANTED);

        // Check camera permission
        const cameraPermission = getPermissionKey('camera') as string;
        const cameraResult = await check(cameraPermission as any);
        permissions.camera = cameraResult === RESULTS.GRANTED;
      } else {
        // iOS - SMS not available, only camera
        const cameraPermission = getPermissionKey('camera') as string;
        if (cameraPermission) {
          const cameraResult = await check(cameraPermission as any);
          permissions.camera = cameraResult === RESULTS.GRANTED;
        }
      }

      set({ permissions });
    } catch (error) {
      console.error('Failed to check permissions:', error);
    }
  },

  requestSmsPermissions: async () => {
    if (Platform.OS !== 'android') {
      return false; // SMS not available on iOS
    }

    try {
      const smsPermissions = getPermissionKey('sms') as string[];
      const results = await Promise.all(
        smsPermissions.map(permission => request(permission as any))
      );
      
      const allGranted = results.every(result => result === RESULTS.GRANTED);
      
      set(state => ({
        permissions: { ...state.permissions, sms: allGranted }
      }));

      return allGranted;
    } catch (error) {
      console.error('Failed to request SMS permissions:', error);
      return false;
    }
  },

  requestCameraPermission: async () => {
    try {
      const cameraPermission = getPermissionKey('camera') as string;
      if (!cameraPermission) return false;

      const result = await request(cameraPermission as any);
      const granted = result === RESULTS.GRANTED;
      
      set(state => ({
        permissions: { ...state.permissions, camera: granted }
      }));

      return granted;
    } catch (error) {
      console.error('Failed to request camera permission:', error);
      return false;
    }
  },
}));

// Initialize settings store
export const initializeSettingsStore = async () => {
  try {
    await useSettingsStore.getState().loadSettings();
  } catch (error) {
    console.error('Failed to initialize settings store:', error);
  }
};