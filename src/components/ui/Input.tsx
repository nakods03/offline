import React, { useState } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native';
import { theme } from '@/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'small' | 'medium' | 'large';
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  variant = 'outlined',
  size = 'medium',
  containerStyle,
  inputStyle,
  labelStyle,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const containerStyles = [
    styles.container,
    containerStyle,
  ];

  const inputContainerStyles = [
    styles.inputContainer,
    styles[variant],
    styles[size],
    isFocused && styles.focused,
    error && styles.error,
  ];

  const textInputStyles = [
    styles.input,
    styles[`${size}Input`],
    inputStyle,
  ];

  const labelStyles = [
    styles.label,
    styles[`${size}Label`],
    error && styles.errorText,
    labelStyle,
  ];

  return (
    <View style={containerStyles}>
      {label && <Text style={labelStyles}>{label}</Text>}
      
      <View style={inputContainerStyles}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        
        <TextInput
          style={textInputStyles}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor={theme.colors.text.tertiary}
          {...textInputProps}
        />
        
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
      
      {(error || hint) && (
        <Text style={[styles.helperText, error && styles.errorText]}>
          {error || hint}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.radius.md,
  },
  input: {
    flex: 1,
    ...theme.typography.body.large,
    color: theme.colors.text.primary,
    padding: 0, // Remove default padding
  },
  label: {
    ...theme.typography.label.medium,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  helperText: {
    ...theme.typography.caption,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.xs,
  },
  errorText: {
    color: theme.colors.error[600],
  },
  leftIcon: {
    marginRight: theme.spacing.sm,
  },
  rightIcon: {
    marginLeft: theme.spacing.sm,
  },

  // Variants
  default: {
    backgroundColor: 'transparent',
  },
  filled: {
    backgroundColor: theme.colors.neutral[50],
  },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  // States
  focused: {
    borderColor: theme.colors.primary[600],
    borderWidth: 2,
  },
  error: {
    borderColor: theme.colors.error[600],
  },

  // Sizes
  small: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    minHeight: 36,
  },
  smallInput: {
    fontSize: 14,
  },
  smallLabel: {
    fontSize: 12,
  },
  medium: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    minHeight: 48,
  },
  mediumInput: {
    fontSize: 16,
  },
  mediumLabel: {
    fontSize: 14,
  },
  large: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    minHeight: 56,
  },
  largeInput: {
    fontSize: 18,
  },
  largeLabel: {
    fontSize: 16,
  },
});