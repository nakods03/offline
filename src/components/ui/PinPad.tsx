import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Vibration } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { theme } from '@/theme';

interface PinPadProps {
  length?: number;
  onComplete: (pin: string) => void;
  onError?: (error: string) => void;
  title?: string;
  subtitle?: string;
  showForgot?: boolean;
  onForgotPress?: () => void;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export const PinPad: React.FC<PinPadProps> = ({
  length = 4,
  onComplete,
  onError,
  title = 'Enter PIN',
  subtitle,
  showForgot = false,
  onForgotPress,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const shakeAnimation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: shakeAnimation.value }],
    };
  });

  const handleNumberPress = (number: string) => {
    if (pin.length < length) {
      const newPin = pin + number;
      setPin(newPin);
      setError('');

      if (newPin.length === length) {
        onComplete(newPin);
      }
    }
  };

  const handleBackspace = () => {
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
      setError('');
    }
  };

  const showError = (message: string) => {
    setError(message);
    setPin('');
    Vibration.vibrate(500);
    
    // Shake animation
    shakeAnimation.value = withSequence(
      withSpring(-10, { duration: 100 }),
      withSpring(10, { duration: 100 }),
      withSpring(-10, { duration: 100 }),
      withSpring(0, { duration: 100 })
    );
  };

  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  const renderPinDots = () => {
    return (
      <AnimatedView style={[styles.pinContainer, animatedStyle]}>
        {Array.from({ length }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.pinDot,
              index < pin.length && styles.pinDotFilled,
              error && styles.pinDotError,
            ]}
          />
        ))}
      </AnimatedView>
    );
  };

  const renderKeypadButton = (value: string, onPress: () => void, style?: any) => (
    <TouchableOpacity
      style={[styles.keypadButton, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.keypadButtonText}>{value}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        
        {renderPinDots()}
        
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>

      <View style={styles.keypad}>
        {/* Row 1 */}
        <View style={styles.keypadRow}>
          {renderKeypadButton('1', () => handleNumberPress('1'))}
          {renderKeypadButton('2', () => handleNumberPress('2'))}
          {renderKeypadButton('3', () => handleNumberPress('3'))}
        </View>

        {/* Row 2 */}
        <View style={styles.keypadRow}>
          {renderKeypadButton('4', () => handleNumberPress('4'))}
          {renderKeypadButton('5', () => handleNumberPress('5'))}
          {renderKeypadButton('6', () => handleNumberPress('6'))}
        </View>

        {/* Row 3 */}
        <View style={styles.keypadRow}>
          {renderKeypadButton('7', () => handleNumberPress('7'))}
          {renderKeypadButton('8', () => handleNumberPress('8'))}
          {renderKeypadButton('9', () => handleNumberPress('9'))}
        </View>

        {/* Row 4 */}
        <View style={styles.keypadRow}>
          {showForgot ? (
            <TouchableOpacity
              style={styles.keypadButton}
              onPress={onForgotPress}
              activeOpacity={0.7}
            >
              <Text style={styles.forgotText}>Forgot?</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.keypadButton} />
          )}
          
          {renderKeypadButton('0', () => handleNumberPress('0'))}
          
          {renderKeypadButton('⌫', handleBackspace, styles.backspaceButton)}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  title: {
    ...theme.typography.heading.h2,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...theme.typography.body.medium,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.neutral[200],
    marginHorizontal: theme.spacing.sm,
  },
  pinDotFilled: {
    backgroundColor: theme.colors.primary[600],
  },
  pinDotError: {
    backgroundColor: theme.colors.error[600],
  },
  errorText: {
    ...theme.typography.body.small,
    color: theme.colors.error[600],
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
  keypad: {
    alignItems: 'center',
  },
  keypadRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  keypadButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: theme.spacing.md,
    ...theme.shadows.sm,
  },
  keypadButtonText: {
    ...theme.typography.heading.h2,
    color: theme.colors.text.primary,
  },
  backspaceButton: {
    backgroundColor: theme.colors.neutral[200],
  },
  forgotText: {
    ...theme.typography.body.small,
    color: theme.colors.primary[600],
    fontWeight: '600',
  },
});