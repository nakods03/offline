import React from 'react';
import { Alert, Platform } from 'react-native';
import TouchID from 'react-native-touch-id';

interface BiometricPromptProps {
  onSuccess: () => void;
  onError: (error: string) => void;
  onCancel?: () => void;
  title?: string;
  subtitle?: string;
}

export const BiometricPrompt: React.FC<BiometricPromptProps> = ({
  onSuccess,
  onError,
  onCancel,
  title = 'Authenticate',
  subtitle = 'Use your biometric to authenticate',
}) => {
  const showBiometricPrompt = async () => {
    try {
      // Check if biometric authentication is available
      const biometryType = await TouchID.isSupported();
      
      if (!biometryType) {
        onError('Biometric authentication not available');
        return;
      }

      const config = {
        title,
        subTitle: subtitle,
        imageColor: '#e00606', // Red color
        imageErrorColor: '#ff0000', // Red color for error
        sensorDescription: 'Touch sensor',
        sensorErrorDescription: 'Failed',
        cancelText: 'Cancel',
        fallbackLabel: 'Show Passcode', // iOS
        unifiedErrors: false, // use unified error messages (default false)
        passcodeFallback: false, // iOS - allows the device passcode to be used as a fallback
      };

      const result = await TouchID.authenticate(title, config);
      
      if (result) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Biometric authentication error:', error);
      
      // Handle different error types
      if (error.name === 'LAErrorUserCancel' || error.message === 'User canceled authentication') {
        onCancel?.();
      } else if (error.name === 'LAErrorUserFallback') {
        // User chose to enter passcode
        onCancel?.();
      } else if (error.name === 'LAErrorSystemCancel') {
        // System cancelled (e.g., another app went to foreground)
        onCancel?.();
      } else if (error.name === 'LAErrorTouchIDNotAvailable') {
        onError('Touch ID not available');
      } else if (error.name === 'LAErrorTouchIDNotEnrolled') {
        onError('Touch ID not enrolled');
      } else if (error.name === 'LAErrorTouchIDLockout') {
        onError('Touch ID locked out');
      } else {
        onError(error.message || 'Biometric authentication failed');
      }
    }
  };

  // Auto-trigger biometric prompt
  React.useEffect(() => {
    showBiometricPrompt();
  }, []);

  return null; // This component doesn't render anything
};

// Utility function to check biometric availability
export const checkBiometricAvailability = async (): Promise<{
  available: boolean;
  type?: string;
  error?: string;
}> => {
  try {
    const biometryType = await TouchID.isSupported();
    
    return {
      available: true,
      type: biometryType,
    };
  } catch (error: any) {
    return {
      available: false,
      error: error.message || 'Biometric authentication not available',
    };
  }
};

// Utility function to show biometric prompt with Promise
export const authenticateWithBiometric = (
  title: string = 'Authenticate',
  subtitle: string = 'Use your biometric to authenticate'
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    TouchID.isSupported()
      .then((biometryType) => {
        const config = {
          title,
          subTitle: subtitle,
          imageColor: '#e00606',
          imageErrorColor: '#ff0000',
          sensorDescription: 'Touch sensor',
          sensorErrorDescription: 'Failed',
          cancelText: 'Cancel',
          fallbackLabel: 'Show Passcode',
          unifiedErrors: false,
          passcodeFallback: false,
        };

        return TouchID.authenticate(title, config);
      })
      .then((success) => {
        resolve(true);
      })
      .catch((error) => {
        console.error('Biometric authentication error:', error);
        reject(error);
      });
  });
};