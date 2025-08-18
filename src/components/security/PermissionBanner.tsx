import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useSettingsStore } from '@/state';
import { theme } from '@/theme';

interface PermissionBannerProps {
  type: 'sms' | 'camera';
  onDismiss?: () => void;
  showDismiss?: boolean;
}

const permissionConfig = {
  sms: {
    title: 'SMS Permissions Required',
    description: Platform.OS === 'android' 
      ? 'Enable SMS permissions to send and receive wallet transactions automatically.'
      : 'SMS functionality is limited on iOS. You can still use manual SMS compose.',
    buttonText: 'Enable SMS',
    icon: '📱',
  },
  camera: {
    title: 'Camera Permission Required',
    description: 'Enable camera access to scan QR codes for adding trusted contacts.',
    buttonText: 'Enable Camera',
    icon: '📷',
  },
};

export const PermissionBanner: React.FC<PermissionBannerProps> = ({
  type,
  onDismiss,
  showDismiss = true,
}) => {
  const { permissions, requestSmsPermissions, requestCameraPermission } = useSettingsStore();
  const config = permissionConfig[type];

  // Don't show banner if permission is already granted
  if (permissions[type]) {
    return null;
  }

  const handleRequestPermission = async () => {
    try {
      if (type === 'sms') {
        await requestSmsPermissions();
      } else if (type === 'camera') {
        await requestCameraPermission();
      }
    } catch (error) {
      console.error(`Failed to request ${type} permission:`, error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{config.icon}</Text>
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>{config.title}</Text>
          <Text style={styles.description}>{config.description}</Text>
        </View>
        
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleRequestPermission}
          >
            <Text style={styles.actionButtonText}>{config.buttonText}</Text>
          </TouchableOpacity>
          
          {showDismiss && onDismiss && (
            <TouchableOpacity
              style={styles.dismissButton}
              onPress={onDismiss}
            >
              <Text style={styles.dismissButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.warning[50],
    borderColor: theme.colors.warning[200],
    borderWidth: 1,
    borderRadius: theme.radius.md,
    margin: theme.spacing.md,
    ...theme.shadows.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  iconContainer: {
    marginRight: theme.spacing.md,
  },
  icon: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  title: {
    ...theme.typography.label.medium,
    color: theme.colors.warning[800],
    marginBottom: theme.spacing.xs,
  },
  description: {
    ...theme.typography.body.small,
    color: theme.colors.warning[700],
    lineHeight: 18,
  },
  actions: {
    alignItems: 'center',
  },
  actionButton: {
    backgroundColor: theme.colors.warning[600],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    marginBottom: theme.spacing.sm,
  },
  actionButtonText: {
    ...theme.typography.label.small,
    color: theme.colors.text.inverse,
    fontWeight: '600',
  },
  dismissButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.warning[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissButtonText: {
    ...theme.typography.caption,
    color: theme.colors.warning[700],
    fontSize: 12,
  },
});