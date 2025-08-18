import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Camera, useCameraDevices, useCodeScanner } from 'react-native-vision-camera';
import { useSettingsStore } from '@/state';
import { parseWalletQR, validateQRData } from './generator';
import { QRData } from '@/types';
import { theme } from '@/theme';

interface QRScannerProps {
  onScan: (data: QRData) => void;
  onClose: () => void;
  title?: string;
}

export const QRScanner: React.FC<QRScannerProps> = ({
  onScan,
  onClose,
  title = 'Scan QR Code',
}) => {
  const devices = useCameraDevices();
  const device = devices.back;
  const [hasPermission, setHasPermission] = useState(false);
  const [isScanning, setIsScanning] = useState(true);
  const { requestCameraPermission, permissions } = useSettingsStore();

  useEffect(() => {
    checkCameraPermission();
  }, []);

  const checkCameraPermission = async () => {
    if (permissions.camera) {
      setHasPermission(true);
    } else {
      const granted = await requestCameraPermission();
      setHasPermission(granted);
      
      if (!granted) {
        Alert.alert(
          'Camera Permission Required',
          'Please enable camera permission in settings to scan QR codes.',
          [{ text: 'OK', onPress: onClose }]
        );
      }
    }
  };

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
    onCodeScanned: (codes) => {
      if (!isScanning) return;
      
      const code = codes[0];
      if (code?.value) {
        setIsScanning(false);
        handleQRScanned(code.value);
      }
    },
  });

  const handleQRScanned = (value: string) => {
    try {
      const qrData = parseWalletQR(value);
      
      if (validateQRData(qrData)) {
        onScan(qrData);
      } else {
        showInvalidQRAlert();
      }
    } catch (error) {
      console.error('QR scan error:', error);
      showInvalidQRAlert();
    }
  };

  const showInvalidQRAlert = () => {
    Alert.alert(
      'Invalid QR Code',
      'This QR code is not a valid wallet QR code. Please scan a wallet QR code from another user.',
      [
        {
          text: 'Try Again',
          onPress: () => setIsScanning(true),
        },
        {
          text: 'Cancel',
          onPress: onClose,
          style: 'cancel',
        },
      ]
    );
  };

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionText}>
            Please enable camera permission to scan QR codes.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={checkCameraPermission}
          >
            <Text style={styles.permissionButtonText}>Enable Camera</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Camera Not Available</Text>
          <Text style={styles.errorText}>
            No camera device found on this device.
          </Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        device={device}
        isActive={isScanning}
        codeScanner={codeScanner}
      />
      
      <View style={styles.overlay}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.scanArea}>
          <View style={styles.scanFrame} />
          <Text style={styles.instruction}>
            Position the QR code within the frame
          </Text>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Scan a wallet QR code to add a trusted contact
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral[900],
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  title: {
    ...theme.typography.heading.h3,
    color: theme.colors.text.inverse,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    ...theme.typography.heading.h4,
    color: theme.colors.text.inverse,
  },
  scanArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: theme.colors.primary[400],
    borderRadius: theme.radius.md,
    backgroundColor: 'transparent',
  },
  instruction: {
    ...theme.typography.body.medium,
    color: theme.colors.text.inverse,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  footer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 60,
  },
  footerText: {
    ...theme.typography.caption,
    color: theme.colors.text.inverse,
    textAlign: 'center',
    opacity: 0.8,
  },
  
  // Permission/Error states
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  permissionTitle: {
    ...theme.typography.heading.h3,
    color: theme.colors.text.inverse,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  permissionText: {
    ...theme.typography.body.medium,
    color: theme.colors.text.inverse,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  permissionButton: {
    backgroundColor: theme.colors.primary[600],
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
  },
  permissionButtonText: {
    ...theme.typography.button,
    color: theme.colors.text.inverse,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  errorTitle: {
    ...theme.typography.heading.h3,
    color: theme.colors.text.inverse,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  errorText: {
    ...theme.typography.body.medium,
    color: theme.colors.text.inverse,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
});